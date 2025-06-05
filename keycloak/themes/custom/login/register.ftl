<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>
    <#if section = "header">
        <div id="kc-header-wrapper">Ready to boost your<br/>learning journey?</div>
        <div id="kc-header-description">Sign up now and start learning with your packs today!</div>
    <#elseif section = "form">
        <form id="kc-register-form" class="custom-form" action="${url.registrationAction}" method="post">
            <div class="form-group">
                <label for="username" class="control-label">${msg("username")}</label>
                <input type="text" id="username" class="form-control" name="username" 
                    value="${(register.formData.username!'')}"
                    aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                    placeholder="Username"
                    autocomplete="username" />
                <#if messagesPerField.existsError('username')>
                    <span id="input-error-username" class="error-message" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('username'))?no_esc}
                    </span>
                </#if>
            </div>
            <div class="form-group">
                <label for="email" class="control-label">${msg("email")}</label>
                <input type="text" id="email" class="form-control" name="email" 
                    value="${(register.formData.email!'')}"
                    aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                    placeholder="Your email"
                    autocomplete="email" />
                <#if messagesPerField.existsError('email')>
                    <span id="input-error-email" class="error-message" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('email'))?no_esc}
                    </span>
                </#if>
            </div>
            <div class="form-group">
                <label for="password" class="control-label">${msg("password")}</label>
                <input type="password" id="password" class="form-control" name="password" 
                    aria-invalid="<#if messagesPerField.existsError('password,password-confirm')>true</#if>"
                    placeholder="Password"
                    autocomplete="new-password" />
                <#if messagesPerField.existsError('password')>
                    <span id="input-error-password" class="error-message" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password'))?no_esc}
                    </span>
                </#if>
            </div>
            <div class="form-group">
                <label for="password-confirm" class="control-label">${msg("passwordConfirm")}</label>
                <input type="password" id="password-confirm" class="form-control" name="password-confirm" 
                    aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                    placeholder="Confirm password"
                    autocomplete="new-password" />
                <#if messagesPerField.existsError('password-confirm')>
                    <span id="input-error-password-confirm" class="error-message" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                    </span>
                </#if>
            </div>

            <div id="kc-form-buttons" class="form-group">
                <input class="btn btn-primary btn-block btn-lg w-full" type="submit" value="${msg("doRegister")}"/>
            </div>
            <div class="form-group text-center">
                <span class="text-sm">Already have an account? 
                    <a href="${url.loginUrl}" class="text-blue-500 hover:underline">${msg("doLogIn")}</a>
                </span>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>