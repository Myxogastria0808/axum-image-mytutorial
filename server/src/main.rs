use axum::{
    Json, Router,
    extract::DefaultBodyLimit,
    http::{Method, header},
    routing::post,
};
use error::AppError;
use model::SampleData;
use tower_http::cors::{Any, CorsLayer};

mod error;
mod model;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), anyhow::Error> {
    // tracing
    let subscriber = tracing_subscriber::FmtSubscriber::builder()
        .with_max_level(tracing::Level::DEBUG)
        .finish();
    tracing::subscriber::set_global_default(subscriber)?;

    // CORS
    let cors: CorsLayer = CorsLayer::new()
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
        .expose_headers([header::CONTENT_DISPOSITION])
        .allow_methods([Method::POST, Method::GET, Method::PATCH, Method::DELETE])
        .allow_origin(Any);

    // Router
    let app: Router<()> = Router::new()
        .route("/", post(app_handler))
        .layer(cors)
        .layer(DefaultBodyLimit::max(1024 * 1024 * 1000)); //1GB

    // Server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:5000").await?;
    tracing::debug!("listening on http://{}", listener.local_addr()?);
    axum::serve(listener, app).await?;
    Ok(())
}

//Handler
async fn app_handler(Json(sample_data): Json<SampleData>) -> Result<(), AppError> {
    process().await?;
    tracing::info!("{:#?}", sample_data);
    Ok(())
}

//process
async fn process() -> Result<(), anyhow::Error> {
    tracing::info!("process");
    Ok(())
}
