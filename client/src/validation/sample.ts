import { z } from "zod";

const ACCEPT_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
const MAX_SIZE = 1024 * 1024 * 100; //100MB

const sampleSchema = z.object({
  name: z.string().min(1, { message: "名前は、1文字以上入れてください。" }),
  image: z
    .custom<FileList>()
    .refine((files) => 0 < files.length, {
      message: "画像ファイルの添付は必須です",
    })
    .refine((files) => 0 < files.length && files.length < 6, {
      message: "添付できる画像ファイルは5枚までです",
    })
    .refine(
      (files) => Array.from(files).every((file) => file.size < MAX_SIZE),
      { message: "添付できる画像ファイルは100MBまでです" }
    )
    .refine(
      (files) =>
        Array.from(files).every((file) =>
          ACCEPT_MIME_TYPES.includes(file.type)
        ),
      { message: "添付できる画像ファイルはjpeg,jpg,png,svgです" }
    ),
  array: z
    .custom<{ element: string }[]>()
    .refine(
      (array) =>
        Array.from(array).every(
          (element) => element.element.includes("^") === false
        ),
      { message: "配列の要素に^は含められません" }
    ),
});

export { sampleSchema };
export type SampleSchemaType = z.infer<typeof sampleSchema>;
