use axum::{
    Router,
    extract::{DefaultBodyLimit, Multipart},
    http::{Method, StatusCode, header},
    response::IntoResponse,
    routing::{get, post},
};
use error::AppError;
use model::SampleRequest;
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

mod error;
mod model;
mod r2;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), anyhow::Error> {
    // // tracing
    // let subscriber = tracing_subscriber::FmtSubscriber::builder()
    //     .with_max_level(tracing::Level::DEBUG)
    //     .finish();
    // tracing::subscriber::set_global_default(subscriber)?;

    // CORS
    let cors: CorsLayer = CorsLayer::new()
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
        .expose_headers([header::CONTENT_DISPOSITION])
        .allow_methods([Method::POST, Method::GET])
        .allow_origin(Any);

    // Router
    let app: Router<()> = Router::new()
        .route("/", get(ping_handler))
        .route("/multipart", post(app_handler))
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(cors)
        .layer(DefaultBodyLimit::max(1024 * 1024 * 100)); //100MB

    // Server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:5000").await?;
    println!("listening on http://{}", listener.local_addr()?);
    axum::serve(listener, app).await?;
    Ok(())
}

//Handler
#[utoipa::path(
    get,
    path = "/",
    tag = "Sample",
    responses(
        (status = 200, description = "OK"),
        (status = 500, description = "Internal Server Error", body = ResponseError),
    ),
)]
pub async fn ping_handler() -> Result<impl IntoResponse, AppError> {
    Ok((StatusCode::OK, "pong".to_string()).into_response())
}

#[utoipa::path(
    post,
    path = "/multipart",
    tag = "Sample",
    request_body(content_type = "multipart/form-data", content = SampleForm),
    responses(
        (status = 201, description = "Created"),
        (status = 500, description = "Internal Server Error", body = ResponseError),
    ),
)]
pub async fn app_handler(mut multipart: Multipart) -> Result<impl IntoResponse + Send, AppError> {
    // multipartの中身をSampleRequestに突っこむ
    let mut sample_request = SampleRequest::default();
    // multipartを一つずつ取り出す
    while let Some(field) = multipart.next_field().await? {
        // fieldの名前を取得してそれぞれ処理する
        match field.name() {
            Some("name") => {
                let name = field.text().await?;
                println!("name: {}", name);
                sample_request.name = name;
            }
            Some("array") => {
                let raw_array = field.text().await?;
                println!("array: {}", raw_array);
                sample_request.array = raw_array
                    .split("^")
                    .skip(1)
                    .map(|s| s.to_string())
                    .collect();
                println!("{:#?}", sample_request.array);
            }
            Some("image") => {
                let binary = field.bytes().await?;
                sample_request.image = binary;
            }
            Some("option") => {
                let option = field.text().await?;
                println!("option: {}", option);
                sample_request.option = if !option.is_empty() {
                    Some(option)
                } else {
                    None
                }
            }
            Some(param_name) => {
                return Err(anyhow::anyhow!("Invalid parameter name: {}", param_name).into());
            }
            None => {
                return Err(anyhow::anyhow!("Parameter not found").into());
            }
        }
    }

    // 結果を確認
    // tracing::info!("Sample Request");
    // println!("{:?}", sample_request);

    // R2にアップロードする
    r2::upload(&sample_request.image).await?;

    Ok((StatusCode::CREATED, ()).into_response())
}

#[derive(OpenApi)]
#[openapi(
    info(
        title = "axum-image-mytutorial-server",
        version = "0.0.1",
        description = "This is a axum-image-mytutorial-server API document.",
        contact(
            name = "Myxogastria0808",
            email = "r.rstudio.c@gmail.com",
            url = "https://yukiosada.work",
        ),
        license(
            name = "WTFPL",
            url = "http://www.wtfpl.net"
        ),
    ),
    servers((url = "http://0.0.0.0:5000")),
    tags(
        (name = "Sample", description = "Sample API"),
    ),
    paths(
        crate::ping_handler,
        crate::app_handler,
    ),
    components(schemas(
        crate::model::SampleForm,
        crate::error::ResponseError,
    ))
)]
struct ApiDoc;
