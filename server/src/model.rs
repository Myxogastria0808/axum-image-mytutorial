use axum::body::Bytes;
use utoipa::ToSchema;

//utopiaのSchema用の構造体
#[derive(Debug, ToSchema)]
#[allow(dead_code)]
pub struct SampleForm {
    name: String,
    #[schema(value_type = String, format = Binary)]
    image: Vec<u8>,
    array: String,
}

//内部で処理するための構造体
#[derive(Debug)]
pub struct SampleRequest {
    pub name: String,
    pub image: Bytes,
    pub array: Vec<String>,
}

impl Default for SampleRequest {
    fn default() -> Self {
        Self {
            name: "".to_string(),
            image: Bytes::new(),
            array: Vec::new(),
        }
    }
}
