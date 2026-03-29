"""HTML layouts for transactional emails (inline styles for broad client support)."""

from html import escape

# Align with frontend tailwind primary palette
_BRAND = "#0284c7"
_BG = "#f0f9ff"
_CARD = "#ffffff"
_TEXT = "#0f172a"
_MUTED = "#64748b"
_BORDER = "#e2e8f0"


def render_transactional_email_html(
    *,
    greeting_name: str,
    headline: str,
    intro: str,
    cta_url: str,
    cta_label: str,
    footnote: str | None = None,
) -> str:
    """Build a branded HTML email with a primary call-to-action button."""
    safe_name = escape(greeting_name)
    safe_headline = escape(headline)
    safe_intro = escape(intro)
    safe_cta = escape(cta_label)
    safe_url = escape(cta_url, quote=True)
    safe_foot = escape(footnote) if footnote else ""

    footnote_block = ""
    if footnote:
        footnote_block = f"""
          <tr>
            <td style="padding: 0 8px 28px 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; color: {_MUTED};">
              {safe_foot}
            </td>
          </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{safe_headline}</title>
</head>
<body style="margin:0; padding:0; background-color:{_BG}; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">{safe_headline}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:{_BG};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; background-color:{_CARD}; border-radius:12px; border:1px solid {_BORDER}; overflow:hidden; box-shadow:0 4px 24px rgba(15, 23, 42, 0.06);">
          <tr>
            <td style="padding: 32px 32px 8px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <div style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: {_TEXT};">
                Notes<span style="color:{_BRAND};">Hub</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 8px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.5; color: {_TEXT};">
              Hi {safe_name},
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 8px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 1.3; color: {_TEXT};">
              {safe_headline}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 32px 24px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: {_TEXT};">
              {safe_intro}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 32px 28px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" bgcolor="{_BRAND}" style="border-radius:8px; background-color:{_BRAND};">
                    <a href="{safe_url}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 600; color:#ffffff; text-decoration:none; border-radius:8px;">
                      {safe_cta}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 28px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.6; color: {_MUTED}; word-break: break-all;">
              Or copy this link into your browser:<br>
              <a href="{safe_url}" style="color:{_BRAND}; text-decoration:underline;">{safe_url}</a>
            </td>
          </tr>
          {footnote_block}
          <tr>
            <td style="padding: 20px 32px 28px 32px; border-top: 1px solid {_BORDER}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: {_MUTED};">
              Sent by NotesHub · This is an automated message; replies are not monitored.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
