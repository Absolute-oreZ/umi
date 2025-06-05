<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo?? displayMessage=!messagesPerField.existsError('username','password'); section>
    <#if section="header">
        <div id="kc-header-wrapper">Welcome back!</div>
        <div id="kc-header-description">Log in to continue your learning experience</div>
    <#elseif section="form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <#if realm.password>
                    <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                        <div class="form-group">
                            <label for="username">Username of email</label>
                            <input tabindex="1" id="username" class="form-control" name="username" value="${(login.username!'')}"
                                   type="text" autofocus autocomplete="off" placeholder="example@gmail.com"/>
                        </div>

                        <div class="form-group">
                            <label for="password">${msg("password")}</label>
                            <input tabindex="2" id="password" class="form-control" name="password" type="password" 
                                   autocomplete="off" placeholder="Enter your password"/>
                        </div>

<div style="display: flex; justify-content: space-between; margin-bottom: 10px; width: full;" class="form-group">
    <#-- Remember Me Checkbox -->
    <#if realm.rememberMe>
        <div class="form-group" style="margin: 0;">
            <label>
                <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"> ${msg("rememberMe")}
            </label>
        </div>
    </#if>

    <#-- Forgot Password Link -->
    <div class="form-group text-center" style="margin: 0;">
        <#if realm.resetPasswordAllowed>
            <a tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
        </#if>
    </div>
</div>


                        <div id="kc-form-buttons" class="form-group">
                            <input type="hidden" id="id-hidden-input" name="credentialId"
                                   <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                            <input tabindex="4" class="btn btn-primary btn-block btn-lg w-full" name="login" id="kc-login" 
                                   type="submit" value="${msg("doLogIn")}"/>
                        </div>
                    </form>
                </#if>

                <#-- Registration Link -->
                <div class="form-group text-center">
                    <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                        <div>
                            Don't have an account? <a href="${url.registrationUrl}">${msg("doRegister")}</a>
                        </div>
                    </#if>
                </div>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
