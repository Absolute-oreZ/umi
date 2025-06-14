package dev.young.backend.filter;

//@Component
//@RequiredArgsConstructor
//public class UserSynchronizerFilter extends OncePerRequestFilter {
//
//    private final UserService userService;
//
//    @Override
//    protected void doFilterInternal(
//            @Nonnull HttpServletRequest request,
//            @Nonnull HttpServletResponse response,
//            @Nonnull FilterChain filterChain
//    ) throws ServletException, IOException {
//        if(!(SecurityContextHolder.getContext().getAuthentication() instanceof AnonymousAuthenticationToken)){
//            JwtAuthenticationToken token = (JwtAuthenticationToken)  SecurityContextHolder.getContext().getAuthentication();
//
//            userService.synchronizeWithIDP(token.getToken());
//        }
//
//        filterChain.doFilter(request,response);
//    }
//}