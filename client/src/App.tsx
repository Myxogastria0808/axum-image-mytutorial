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

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

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
    // await fetch("http://localhost:5000/", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(formData),
    // })
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((e) => {
    //     console.error(e);
    //   });
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
            allowImageEdit={true}
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
