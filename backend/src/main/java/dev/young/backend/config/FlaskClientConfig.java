package dev.young.backend.config;

//@Configuration
//public class FlaskClientConfig {
//
//    @Value("${ml-recommendation.url}")
//    private String mlRecommendationUrl;
//
//    @Value("${ml-recommendation.service-token}")
//    private String serviceToken;
//
//    @Bean
//    public RestTemplate flaskRestTemplate() {
//        return new RestTemplate();
//    }
//
//    @Bean
//    public FlaskClient flaskClient() {
//        return new FlaskClient(
//                flaskRestTemplate(),
//                mlRecommendationUrl,
//                serviceToken
//        );
//    }
//}