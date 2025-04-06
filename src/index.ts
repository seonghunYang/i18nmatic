import { Loader } from "./loader";
import * as core from "./core";
import { createLanguageCheckFunction, handleParseError } from "./common";
import { Generator } from "./generator";
import { Extractor } from "./extractor";
import { ExtractedText } from "./core/type";

//TODO: 제외 경로 추가, ns 정의
interface Options {
  runType: RunType;
  locales: string[];
  defaultLocale: string;
  outputDir: string;
  entry: string;
  enablePrettier: boolean;
  outputFileName: string;
}

export async function main(options: Options) {
  const {
    entry,
    locales,
    defaultLocale,
    outputDir,
    runType,
    enablePrettier,
    outputFileName,
  } = options;

  const loader = new Loader({
    entry: entry,
  });

  const generator = new Generator({
    enablePrettier: enablePrettier,
  });

  const extractedTexts: ExtractedText[] = [];

  // 추후 여러 언어 동적 할당
  loader.load(
    (file) => {
      try {
        const { ast: transformAst, isChanged } = core.transform(
          file.ast,
          createLanguageCheckFunction("ko"),
          runType
        );

        if (isChanged) {
          generator.generate(transformAst, file.filepath);
        }

        extractedTexts.push(
          ...new Extractor(
            file.ast,
            createLanguageCheckFunction("ko"),
            file.filepath
          ).extract()
        );
      } catch (error) {
        handleParseError(error, file.filepath);
      }
    },
    {
      onLoaded: () => {
        generator.generateJson(
          extractedTexts,
          locales,
          outputDir,
          outputFileName
        );
      },
    }
  );
}
