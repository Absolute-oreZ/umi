package dev.young.backend.filter;

//@Component
//@RequiredArgsConstructor
//public class JwtAuthFilter extends OncePerRequestFilter {
//
//    @Value("${application.supabase.url}")
//    private String supabaseUrl;
//
//    @Override
//    protected void doFilterInternal(
//            @Nonnull HttpServletRequest request,
//            @Nonnull HttpServletResponse response,
//            @Nonnull FilterChain filterChain
//    ) throws ServletException, IOException {
//        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        String token = authHeader.substring(7);
//
//        // call Supabase to verify token
//        try {
//            WebClient webClient = WebClient.builder().build();
//            JsonNode userInfo = webClient
//                    .get()
//                    .uri(supabaseUrl + "/auth/v1/user")
//                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
//                    .retrieve()
//                    .bodyToMono(JsonNode.class)
//                    .block();
//
//            if (userInfo != null && userInfo.has("id")) {
//                String userId = userInfo.get("id").asText();
//
//                // Set Spring Security context
//                var auth = new UsernamePasswordAuthenticationToken(
//                        userId, null, Collections.emptyList()
//                );
//                SecurityContextHolder.getContext().setAuthentication(auth);
//            }
//
//        } catch (Exception e) {
//            logger.warn("JWT verification failed");
//            e.printStackTrace();
//        }
//
//        filterChain.doFilter(request, response);
//    }
//}