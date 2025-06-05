<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${msg("termsTitle")}</title>
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico">
    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <style>
        .terms-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .terms-content {
            line-height: 1.6;
        }
        
        .terms-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .terms-section {
            margin-bottom: 20px;
        }
        
        .terms-footer {
            margin-top: 30px;
            text-align: center;
        }
        
        .accept-button {
            background-color: #0078d4;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        
        .accept-button:hover {
            background-color: #005a9e;
        }
        
        .decline-button {
            background-color: #dc3545;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-left: 10px;
        }
        
        .decline-button:hover {
            background-color: #c82333;
        }
    </style>
</head>
<body>
    <div class="terms-container">
        <div class="terms-header">
            <h1>Terms and Conditions</h1>
            <p><em>Last Updated: 03/02/2025</em></p>
        </div>
        
        <div class="terms-content">
           ${msg("termsText")?no_esc}
        </div>
        
        <div class="terms-footer">
            <form action="${url.loginAction}" method="POST">
                <input type="button" class="accept-button" value="${msg("doAccept")}" onclick="submit()"/>
                <input type="button" class="decline-button" value="${msg("doDecline")}" onclick="window.location.href='${url.loginUrl}'"/>
            </form>
        </div>
    </div>
</body>
</html>