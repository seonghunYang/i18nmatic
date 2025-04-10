import { Loader } from "./loader";
import * as core from "./core";
import { handleParseError } from "./common";
import { createLanguageCheckFunction } from "./common/language";
import { Generator } from "./generator";
import { Extractor } from "./extractor";
import { ExtractedText } from "./core/type";
import { RunType, KeyLanguage } from "./type";

//TODO: 제외 경로 추가, ns 정의
interface Options {
  runType: RunType;
  keyLanguage: KeyLanguage;
  locales: string[];
  outputDir: string;
  entry: string;
  enablePrettier: boolean;
  outputFileName: string;
}

export async function main(options: Options) {
  const {
    entry,
    locales,
    outputDir,
    runType,
    enablePrettier,
    outputFileName,
    keyLanguage,
  } = options;

  const loader = new Loader({
    entry: entry,
  });

  const generator = new Generator({
    enablePrettier: enablePrettier,
  });

  const extractedTexts: ExtractedText[] = [];

  // 추후 여러 언어 동적 할당
  await loader.load((file) => {
    try {
      const { ast: transformAst, isChanged } = core.transform(
        file.ast,
        createLanguageCheckFunction(keyLanguage),
        runType
      );

      if (isChanged) {
        generator.generate(transformAst, file.filepath);
      }

      extractedTexts.push(
        ...new Extractor(
          file.ast,
          createLanguageCheckFunction(keyLanguage),
          file.filepath
        ).extract()
      );
    } catch (error) {
      handleParseError(error, file.filepath);
    }
  });

  generator.generateJson(extractedTexts, locales, outputDir, outputFileName);
}
