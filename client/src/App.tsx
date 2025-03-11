import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
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
    defaultValues: {
      image: new DataTransfer().files,
    },
  });

  const onSubmit: SubmitHandler<SampleSchemaType> = async (formData) => {
    console.table(formData);

    const multipartFomrData = new FormData();
    // string
    multipartFomrData.append("name", formData.name);
    const convertedArray: string = formData.array
      .map((element) => "^" + element.element)
      .join("");
    multipartFomrData.append("array", convertedArray);
    // image
    multipartFomrData.append(
      "image",
      new Blob([formData.image[0]], { type: formData.image[0].type }),
      formData.image[0].name
    );

    //* backend *//
    await fetch("http://localhost:5000/multipart", {
      method: "POST",
      body: multipartFomrData,
    })
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const arraySample = useFieldArray({
    name: "array",
    control,
  });

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
      <label htmlFor="array">Array: </label>
      {arraySample.fields.map((field, index: number) => (
        <div key={field.id}>
          <label htmlFor="array">{index}</label>
          <select id="aray" {...register(`array.${index}.element` as const)}>
            <option value="USB">USB</option>
            <option value="HDMI">HDMI</option>
            <option value="VGA">VGA</option>
            <option value="DVI">DVI</option>
          </select>
          {index >= 0 && (
            <input
              type="submit"
              value="✕"
              onClick={() => arraySample.remove(index)}
            />
          )}
        </div>
      ))}
      <br />
      <ErrorMessage
        errors={errors}
        name="array"
        message={errors.array?.message}
      />
      <br />
      <input
        type="button"
        value="要素の追加"
        onClick={() => arraySample.append({ element: "USB" })}
      />
      <br />
      <input type="submit" value="登録" />
    </form>
  );
};

export default App;
