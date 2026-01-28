<?php

function getEmailTemplate($title, $content, $ctaLink = null, $ctaText = null, $isInternal = false) {
    // Branding & Config
    $siteUrl = "https://mixturemarketing.pl";
    $logoUrl = "https://mixturemarketing.pl/assets/images/sygnet.png"; // Upewnij się, że ten plik istnieje! 
    
    // Contact Info
    $phone = "+48 794 443 551";
    $email = "info@mixturemarketing.pl";
    $address = "Al. Józefa Piłsudskiego 17 / 4, 35-074 Rzeszów";
    
    // Colors
    $colorBg = "#F0F4F8";
    $colorCard = "#FFFFFF";
    $colorPrimary = "#213261";
    $colorAccent = "#61B6DE";
    $colorText = "#334155";
    $colorGray = "#94A3B8";
    
    // Button Style - Clean string, no newlines
    $btnStyle = "display:inline-block; background-color:$colorPrimary; color:#ffffff; font-family:Helvetica, Arial, sans-serif; font-size:14px; font-weight:bold; line-height:50px; text-align:center; text-decoration:none; width:240px; -webkit-text-size-adjust:none; border-radius:12px; text-transform:uppercase; letter-spacing:1px;";

    // CTA Section
    $ctaHtml = "";
    if ($ctaLink && $ctaText) {
        $ctaHtml = '
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
            <tr>
                <td align="center">
                    <div><!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="'.$ctaLink.'" style="height:50px;v-text-anchor:middle;width:240px;" arcsize="24%" stroke="f" fillcolor="'.$colorPrimary.'">
                        <w:anchorlock/>
                        <center>
                      <![endif]-->
                          <a href="'.$ctaLink.'" target="_blank" style="'.$btnStyle.'">'.$ctaText.'</a>
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
        $socialHtml .= "<a href='$link' target='_blank' style='color: $colorPrimary; text-decoration: none; margin: 0 12px; font-weight: 600; font-size: 12px; text-transform: uppercase;'>$name</a>";
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
            a { color: $colorAccent; text-decoration: none; font-weight: 600; }
            a:hover { text-decoration: underline; }
            p { margin: 0 0 1.5em 0; line-height: 1.6; }
            ul { margin: 0 0 1.5em 20px; padding: 0; }
            li { margin-bottom: 0.5em; }
        </style>
    </head>
    <body style='background-color: $colorBg; font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif; color: $colorText;'>
        
        <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color: $colorBg;'>
            <tr>
                <td align='center' style='padding: 40px 10px;'>
                    
                    <!-- Container -->
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='600' style='max-width: 600px; width: 100%; background-color: $colorCard; border-radius: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.06); overflow: hidden;'>
                        
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
                                <h1 style='margin: 0 0 25px 0; font-size: 24px; font-weight: 800; color: $colorPrimary; text-align: center; letter-spacing: -0.5px;'>$title</h1>
                                
                                <div style='font-size: 16px; color: $colorText;'>
                                    $content
                                </div>

                                $ctaHtml
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style='background-color: #FAFAFA; padding: 30px 40px; text-align: center; border-top: 1px solid #EAEAEA;'>
                                <div style='margin-bottom: 20px;'>
                                    $socialHtml
                                </div>
                                
                                <p style='font-size: 12px; color: $colorGray; margin-bottom: 10px;'>
                                    <strong>Mixture Marketing Sp. z o.o.</strong><br>
                                    $address<br>
                                    NIP: PL5170435774
                                </p>
                                
                                <p style='font-size: 12px; color: $colorGray; margin: 0;'>
                                    <a href='mailto:$email' style='color: $colorGray; text-decoration: none;'>$email</a> &bull; 
                                    <a href='tel:" . str_replace(' ', '', $phone) . "' style='color: $colorGray; text-decoration: none;'>$phone</a>
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
                            <td align='center' style='padding: 20px; font-size: 11px; color: #94A3B8;'>
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