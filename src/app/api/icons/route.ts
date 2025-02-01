import { NextRequest, NextResponse } from "next/server";
import { optimize, loadConfig } from "svgo";
import camelcase from "camelcase";
import AdmZip from "adm-zip";

const config = await loadConfig();

function generateComponentName(fileName: string) {
  return `${camelcase(fileName.replace(/.svg/, ""), {
    pascalCase: true,
  })}Icon`.replace("IconIcon", "Icon");
}

async function processSvgFile(
  fileName: string,
  content: string,
  isTypescript: boolean
) {
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

  const props = isTypescript
    ? "props?: React.SVGProps<SVGSVGElement>"
    : "props";

  return `import React from "react";
export default function ${componentName}(${props}) {
  return ${processedContent};
}`;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const options = JSON.parse(formData.get("options") as string);
  const isTypescript = options?.isTypescript;

  const components = {};

  for (const file of files) {
    if (file.name.endsWith(".svg")) {
      const rawContent = await file.text();
      const { data } = optimize(rawContent, config as any);
      const componentCode = await processSvgFile(file.name, data, isTypescript);
      // @ts-ignore
      components[file.name] = componentCode;
    }
  }

  const zip = new AdmZip();
  let indexContent = "";

  for (const [fileName, content] of Object.entries(components)) {
    const componentName = generateComponentName(fileName);
    zip.addFile(
      `${componentName}.${isTypescript ? "tsx" : "jsx"}`,
      Buffer.from(content as any, "utf-8")
    );
    indexContent += `export { default as ${componentName} } from './${componentName}';\n`;
  }
  zip.addFile(
    `index.${isTypescript ? "ts" : "js"}`,
    Buffer.from(indexContent, "utf-8")
  );

  return new NextResponse(zip.toBuffer(), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=icons.zip",
    },
  });
}
