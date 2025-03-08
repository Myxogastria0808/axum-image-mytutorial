use crate::error::AppError;
use cf_r2_sdk::builder::Builder;
use dotenvy::dotenv;
use image::DynamicImage;
use std::env;
use webp::{Encoder, WebPMemory};

pub async fn upload(binary: &[u8]) -> Result<(), AppError> {
    // load .env file
    dotenv()?;
    // insert a environment variable
    let bucket_name: String = env::var("BUCKET_NAME")?;
    let endpoint_url: String = env::var("ENDPOINT_URL")?;
    let access_key_id: String = env::var("ACCESS_KEY_ID")?;
    let secret_access_key: String = env::var("SECRET_ACCESS_KEY")?;
    let region: String = env::var("REGION")?;

    let object: cf_r2_sdk::operator::Operator = Builder::new()
        .set_bucket_name(bucket_name)
        .set_access_key_id(access_key_id)
        .set_secret_access_key(secret_access_key)
        .set_endpoint(endpoint_url)
        .set_region(region)
        .create_client_result()?;

    let webp = convert_to_webp(binary, 75.0)?;

    object
        .upload_binary("hello.webp", "image/webp", &webp, None)
        .await?;

    // test
    let test = object.download("hello.webp").await?;
    println!("{:?}", test);
    Ok(())
}

fn quality_range_protector(quality: f32) -> Result<f32, AppError> {
    if (0.0..=100.0).contains(&quality) {
        Ok(quality)
    } else {
        Err(anyhow::anyhow!("Quality must be between 0 and 100".to_string()).into())
    }
}

fn convert_to_webp(binary: &[u8], quality: f32) -> Result<WebPMemory, AppError> {
    let img: DynamicImage = image::load_from_memory(binary).map_err(|e| -> AppError {
        anyhow::anyhow!(format!("Failed to load image from memory: {}", e)).into()
    })?;
    let encoder: Encoder<'_> = Encoder::from_image(&img).map_err(|e| -> AppError {
        anyhow::anyhow!(format!("Failed to create a webp encoder: {}", e)).into()
    })?;
    let webp: WebPMemory = encoder.encode(quality_range_protector(quality)?);
    Ok(webp)
}
