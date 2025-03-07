# axum-image-mytutorial

画像のみをclentで直接処理し、serverにはそれ以外のデータを送っているサンプル

## CORS ポリシー

R2のCORSポリシーを以下のように設定する

```json
[
  {
    "AllowedOrigins": [
      "*"
    ],
    "AllowedMethods": [
      "PUT"
    ],
    "AllowedHeaders": [
      "*"
    ]
  }
]
```

## References

### mulitipart/form-data (client)

https://zenn.dev/suzuesa/scraps/4b34463048688d

https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/

### mulitipart/form-data (server)

https://saigo-sys.hatenablog.com/entry/2024/07/20/195758

https://stackoverflow.com/questions/79187416/how-to-show-multipart-form-data-with-a-file-upload-field-in-swagger-ui-with-rust

### About form of file

https://zenn.dev/kondo0602/articles/6496b0de8fca72

https://pote-chil.com/posts/zod-file-validation

### About FilePond plugin

https://pqina.nl/filepond/plugins/

