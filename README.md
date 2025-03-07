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
      "GET",
      "PUT"
    ],
    "AllowedHeaders": [
      "*"
    ]
  }
]
```

## References

### About form of file

https://zenn.dev/kondo0602/articles/6496b0de8fca72

https://pote-chil.com/posts/zod-file-validation

### About `Buffer`

https://xinformation.hatenadiary.com/entry/2024/05/21/070500

### About FilePond plugin

https://pqina.nl/filepond/plugins/

