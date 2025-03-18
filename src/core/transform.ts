import { findHookContextNode } from "./finder";
import { Insertion } from "./insertion";
import { TWrapper } from "./twrapper";
import * as t from "@babel/types";

export function transform(
  ast: t.File,
  checkLanguage: (text: string) => boolean
): {
  ast: t.File;
  isChanged: boolean;
} {
  const hookContextNodes = findHookContextNode(ast);

  const wrapper = new TWrapper(hookContextNodes, checkLanguage);

  wrapper.wrap();

  const insertion = new Insertion(hookContextNodes, ast);

  const isChanged = insertion.insert();

  return { ast, isChanged };
}
