<?php
require_once __DIR__ . '/../config_styles.php';

function getEmailTemplate($title, $content, $ctaLink = null, $ctaText = null, $isInternal = false) {
    global $BRAND, $EMAIL_STYLES;
    
    // Branding & Config
    $siteUrl = "https://mixturemarketing.pl";
    $logoUrl = "https://mixturemarketing.pl/assets/images/sygnet.png"; 
    
    // Contact Info
    $phone = "+48 794 443 551";
    $email = "info@mixturemarketing.pl";
    $address = "Al. Józefa Piłsudskiego 17 / 4, 35-074 Rzeszów";
    
    // CTA Section
    $ctaHtml = "";
    if ($ctaLink && $ctaText) {
        $ctaHtml = '
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
            <tr>
                <td align="center">
                    <div><!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="'.$ctaLink.'" style="height:50px;v-text-anchor:middle;width:240px;" arcsize="24%" stroke="f" fillcolor="'.$BRAND['primary'].'">
                        <w:anchorlock/>
                        <center>
                      <![endif]-->
                          <a href="'.$ctaLink.'" target="_blank" style="'.$EMAIL_STYLES['button'].'">'.$ctaText.'</a>
                      <!--[if mso]>
                        </center>
                      </v:roundrect>
                    <![endif]--></div>
                </td>
            </tr>
        </table>';
    }

    // Socials
    $socials = [
        'LinkedIn' => 'https://pl.linkedin.com/company/mixture-marketing',
        'Facebook' => 'https://www.facebook.com/MixtureMarketing',
        'TikTok' => 'https://www.tiktok.com/@mixturemarketing'
    ];
    
    $socialHtml = "";
    foreach ($socials as $name => $link) {
        $socialHtml .= "<a href='$link' target='_blank' style='color: {$BRAND['primary']}; text-decoration: none; margin: 0 12px; font-weight: 600; font-size: 12px; text-transform: uppercase;'>$name</a>";
    }

    return "
    <!DOCTYPE html>
    <html lang='pl'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>$title</title>
        <style>
            body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
            a { color: {$BRAND['accent']}; text-decoration: none; font-weight: 600; }
            a:hover { text-decoration: underline; }
            p { margin: 0 0 1.5em 0; line-height: 1.6; }
            ul { margin: 0 0 1.5em 20px; padding: 0; }
            li { margin-bottom: 0.5em; }
        </style>
    </head>
    <body style='{$EMAIL_STYLES['body']}'>
        
        <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color: {$BRAND['bg']};'>
            <tr>
                <td align='center' style='padding: 40px 10px;'>
                    
                    <!-- Container -->
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='600' style='{$EMAIL_STYLES['container']}'>
                        
                        <!-- Header -->
                        <tr>
                            <td align='center' style='padding: 40px 0 20px 0;'>
                                <a href='$siteUrl' target='_blank'>
                                    <img src='$logoUrl' alt='Mixture Marketing' width='50' style='display: block; width: 50px; height: auto; border-radius: 8px;'>
                                </a>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style='padding: 0 50px 30px 50px; text-align: left;'>
                                <h1 style='margin: 0 0 25px 0; font-size: 24px; font-weight: 800; color: {$BRAND['primary']}; text-align: center; letter-spacing: -0.5px;'>$title</h1>
                                
                                <div style='font-size: 16px; color: {$BRAND['text']};'>
                                    $content
                                </div>

                                $ctaHtml
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style='{$EMAIL_STYLES['footer']}'>
                                <div style='margin-bottom: 20px;'>
                                    $socialHtml
                                </div>
                                
                                <p style='font-size: 12px; color: {$BRAND['gray']}; margin-bottom: 10px;'>
                                    <strong>Mixture Marketing Sp. z o.o.</strong><br>
                                    $address<br>
                                    NIP: PL5170435774
                                </p>
                                
                                <p style='font-size: 12px; color: {$BRAND['gray']}; margin: 0;'>
                                    <a href='mailto:$email' style='color: {$BRAND['gray']}; text-decoration: none;'>$email</a> &bull; 
                                    <a href='tel:" . str_replace(' ', '', $phone) . "' style='color: {$BRAND['gray']}; text-decoration: none;'>$phone</a>
                                </p>
                                
                                <div style='margin-top: 20px; font-size: 10px; color: #999;'>
                                    <a href='$siteUrl/privacy-policy' style='color: #999; text-decoration: underline;'>Polityka Prywatności</a>
                                </div>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Unsubscribe Hint -->
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'>
                        <tr>
                            <td align='center' style='padding: 20px; font-size: 11px; color: {$BRAND['gray']};'>
                                <p style='margin: 0;'>Otrzymałeś tę wiadomość w związku z zapytaniem na stronie mixturemarketing.pl</p>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    ";
}
?>