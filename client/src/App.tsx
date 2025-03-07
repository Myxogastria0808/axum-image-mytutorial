import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { ErrorMessage } from "@hookform/error-message";
import { sampleSchema, SampleSchemaType } from "./validation/sample";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import imageCompression from "browser-image-compression";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const endpoint: string = import.meta.env.VITE_ENDPOINT;
const accessKeyId: string = import.meta.env.VITE_ACCESS_KEY_ID;
const secretAccessKey: string = import.meta.env.VITE_SECRET_ACCESS_KEY;
const bucket: string = import.meta.env.VITE_BUCKET;

//* R2 *//
//インスタンスの作成
const s3: S3Client = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    // @ts-ignore
    signatureVersion: "v4",
  },
});

//バケットにオブジェクトの追加
//Bucketが、保存したいバケット名
//Keyが、ファイル名になる
//Bodyが、保存したいオブジェクト本体
const addObject = async (filename: string, data: Buffer): Promise<void> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      ContentType: "image/webp",
      Body: data,
    })
  );
};

type ServerSampleData = {
  name: string;
};

const App: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SampleSchemaType>({
    resolver: zodResolver(sampleSchema),
  });

  const onSubmit: SubmitHandler<SampleSchemaType> = async (formData) => {
    console.table(formData);

    //* backend *//
    const serverData: ServerSampleData = {
      name: formData.name,
    };
    await fetch("http://localhost:5000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(serverData),
    })
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        console.error(e);
      });

    //* R2 *//
    // convert to webp
    const webp: File = await imageCompression(formData.image[0], {
      initialQuality: 0.75,
      fileType: "image/webp",
    });
    // convert to Buffer
    const arrayBuffer: ArrayBuffer = await webp.arrayBuffer();
    const buffer: Buffer<ArrayBuffer> = Buffer.from(arrayBuffer);
    // upload to R2
    await addObject("hello.webp", buffer);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="name">Name: </label>
      <input id="name" type="text" {...register("name")} />
      <br />
      <ErrorMessage
        errors={errors}
        name="name"
        message={errors.name?.message}
      />
      <br />
      <Controller
        name="image"
        control={control}
        render={({ field: { onChange, name } }) => (
          <FilePond
            name={name}
            storeAsFile={true}
            credits={false}
            labelIdle={
              '<span class="filepond--label-action"> ファイル選択 </span> または ドラッグ&ドロップ'
            }
            onupdatefiles={(files) => {
              const dataTransfer = new DataTransfer();
              files.forEach((file) =>
                dataTransfer.items.add(file.file as File)
              );
              onChange(dataTransfer.files);
            }}
          />
        )}
      />
      <br />
      <ErrorMessage
        errors={errors}
        name="image"
        message={errors.image?.message}
      />
      <br />
      <input type="submit" value="登録" />
    </form>
  );
};

export default App;
