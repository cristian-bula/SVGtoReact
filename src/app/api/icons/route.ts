import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { optimize, loadConfig } from "svgo";
import camelcase from "camelcase";
import rmrf from "rmrf";
import AdmZip from "adm-zip";

const IS_TYPESCRIPT = true;
const config = await loadConfig();

function generateComponentName(fileName: string) {
  const componentName = `${camelcase(fileName.replace(/.svg/, ""), {
    pascalCase: true,
  })}Icon`;
  return componentName.replace("IconIcon", "Icon");
}

async function createDirectories(
  userRawPath: string,
  userOptimizedPath: string,
  userOutputPath: string
) {
  await fs.mkdir(userRawPath, { recursive: true });
  await fs.mkdir(userOptimizedPath, { recursive: true });
  await fs.mkdir(userOutputPath, { recursive: true });
}

async function processSvgFile(
  fileName: string,
  outDir: string,
  userOptimizedPath: string
) {
  const content = await fs.readFile(
    `${userOptimizedPath}/${fileName}`,
    "utf-8"
  );
  const componentName = generateComponentName(fileName);
  let processedContent = content
    .replaceAll(/="#(fff|ffffff|000|000000)"/g, '="currentColor"')
    .replaceAll(/(\r\n|\n|\r)/gm, "")
    .replaceAll(/\s+/g, " ")
    .replaceAll("> <", "><")
    .replaceAll("clip-rule", "clipRule")
    .replaceAll("fill-rule", "fillRule")
    .replaceAll("stroke-linecap", "strokeLinecap")
    .replaceAll("stroke-linejoin", "strokeLinejoin")
    .replaceAll("stroke-miterlimit", "strokeMiterlimit")
    .replaceAll("stroke-width", "strokeWidth")
    .replaceAll("stroke-dasharray", "strokeDasharray")
    .replaceAll("stroke-dashoffset", "strokeDashoffset")
    .replaceAll("fill-opacity", "fillOpacity")
    .replaceAll("stroke-opacity", "strokeOpacity")
    .replaceAll("clip-path", "clipPath")
    .replaceAll(`xml:space="preserve"`, "");

  const startSVG = processedContent.indexOf("<svg");
  const endSVG = processedContent.slice(startSVG).indexOf(">") + startSVG;
  processedContent =
    processedContent.substring(0, endSVG) +
    " {...props}" +
    processedContent.substring(endSVG);

  const props = IS_TYPESCRIPT
    ? "props?: React.SVGProps<SVGSVGElement>"
    : "props";

  const svgReactContent = `import React from "react";
export default function ${componentName}(${props}) {
  return ${processedContent};
}`;

  await fs.writeFile(
    `${outDir}/${componentName}.${IS_TYPESCRIPT ? "tsx" : "jsx"}`,
    svgReactContent,
    "utf-8"
  );
}

async function processFile(
  file: File,
  userRawPath: string,
  userOptimizedPath: string
) {
  const filePath = path.join(userRawPath, file.name);
  await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  if (file.name.endsWith(".svg")) {
    const { data } = optimize(await fs.readFile(filePath, "utf-8"), {
      ...config,
      path: path.join(userOptimizedPath, file.name),
    });
    await fs.writeFile(path.join(userOptimizedPath, file.name), data, "utf-8");
  }
}

async function buildIcons(
  files: File[],
  userRawPath: string,
  userOptimizedPath: string,
  userOutputPath: string
) {
  await Promise.all(
    files.map(async (file: any) => {
      await processFile(file, userRawPath, userOptimizedPath);
    })
  );

  const filesOptimized = await fs.readdir(userOptimizedPath);
  await Promise.all(
    filesOptimized.map((file) =>
      processSvgFile(file, userOutputPath, userOptimizedPath)
    )
  );

  const indexContent = filesOptimized
    .map((file) => {
      const componentName = generateComponentName(file);
      return `export { default as ${componentName} } from './${componentName}';\n`;
    })
    .join("");

  await fs.writeFile(
    `${userOutputPath}/index.${IS_TYPESCRIPT ? "ts" : "js"}`,
    indexContent,
    "utf-8"
  );
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const userId = formData.get("userId") as string;
  const files = formData.getAll("files") as File[];

  const userRawPath = path.join(process.cwd(), `src/icons/${userId}/raw`);
  const userOptimizedPath = path.join(
    process.cwd(),
    `src/icons/${userId}/optimized`
  );
  const userOutputPath = path.join(
    process.cwd(),
    `src/icons/${userId}/components`
  );

  await createDirectories(userRawPath, userOptimizedPath, userOutputPath);

  await buildIcons(files, userRawPath, userOptimizedPath, userOutputPath);

  const zip = new AdmZip();
  const componentFiles = await fs.readdir(userOutputPath);

  for (const file of componentFiles) {
    const filePath = path.join(userOutputPath, file);
    zip.addLocalFile(filePath);
  }

  rmrf("./src/icons");

  const zipBuffer = zip.toBuffer();
  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=icons.zip`,
    },
  });
}
