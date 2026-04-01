import Script from 'next/script';

export const HeadScripts = () => (
  <>
    <link
      rel="preconnect"
      href="https://www.googletagmanager.com"
      crossOrigin="anonymous"
    />
    <Script id="google-analytics-delayed" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        
        var gtagLoaded = false;
        
        function loadGoogleAnalytics() {
          if (gtagLoaded) return;
          gtagLoaded = true;
          
          var script = document.createElement('script');
          script.async = true;
          script.src = 'https://www.googletagmanager.com/gtag/js?id=G-GY83Q99SMG';
          document.head.appendChild(script);
          
          script.onload = function() {
            gtag('js', new Date());
            gtag('config', 'G-GY83Q99SMG');
          };
        }
        
        function onUserInteraction() {
          if (gtagLoaded) return;
          loadGoogleAnalytics();
        }
        
        ['mousemove', 'scroll', 'touchstart', 'keydown'].forEach(function(event) {
          document.addEventListener(event, onUserInteraction, { once: true });
        });
        
        // Backup run after 4 seconds if user does nothing
        setTimeout(loadGoogleAnalytics, 4000);
      `}
    </Script>
  </>
);
