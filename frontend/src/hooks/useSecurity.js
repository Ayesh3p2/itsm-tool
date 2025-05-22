import { useEffect } from 'react';
import securityConfig from '../config/security';

const useSecurity = () => {
    useEffect(() => {
        // Protect console access
        if (securityConfig.consoleProtection.enabled) {
            const originalConsole = {};
            
            // Store original console methods
            securityConfig.consoleProtection.methods.forEach(method => {
                originalConsole[method] = console[method];
                console[method] = () => {
                    console.error(securityConfig.consoleProtection.message);
                };
            });

            // Restore console methods on unmount
            return () => {
                securityConfig.consoleProtection.methods.forEach(method => {
                    console[method] = originalConsole[method];
                });
            };
        }

        // Add code integrity check
        if (securityConfig.codeIntegrity.enabled) {
            const checkCodeIntegrity = () => {
                securityConfig.codeIntegrity.criticalFiles.forEach(file => {
                    const element = document.querySelector(file);
                    if (element) {
                        const hash = crypto.createHash('sha256');
                        const fileContent = element.textContent || element.innerHTML;
                        hash.update(fileContent);
                        const fileHash = hash.digest('hex');

                        // Store hash in localStorage on first load
                        if (!localStorage.getItem(`fileHash:${file}`)) {
                            localStorage.setItem(`fileHash:${file}`, fileHash);
                        } else {
                            // Compare with stored hash
                            if (localStorage.getItem(`fileHash:${file}`) !== fileHash) {
                                console.error('Code integrity check failed:', file);
                                // You can add additional security measures here
                            }
                        }
                    }
                });
            };

            // Initial check
            checkCodeIntegrity();

            // Periodic checks
            const interval = setInterval(checkCodeIntegrity, securityConfig.codeIntegrity.checkInterval);

            // Cleanup
            return () => clearInterval(interval);
        }

        // Add XSS protection
        if (securityConfig.xssProtection.enabled) {
            const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
            Object.defineProperty(Element.prototype, 'innerHTML', {
                set: function(value) {
                    if (typeof value === 'string') {
                        // Strip disallowed tags and attributes
                        const allowedTags = securityConfig.xssProtection.allowedTags.join('|');
                        const allowedAttributes = securityConfig.xssProtection.allowedAttributes.join('|');
                        const regex = new RegExp(`<(?!(${allowedTags})[^>]*(${allowedAttributes})=[^>]*>)[^>]*>`, 'gi');
                        value = value.replace(regex, '');
                    }
                    originalInnerHTML.set.call(this, value);
                },
                get: function() {
                    return originalInnerHTML.get.call(this);
                }
            });
        }

        // Add security headers
        Object.keys(securityConfig.securityHeaders).forEach(header => {
            document.documentElement.setAttribute(`data-${header.toLowerCase()}`, securityConfig.securityHeaders[header]);
        });

        // Add CSP nonce for inline scripts
        const nonce = securityConfig.nonce();
        document.documentElement.setAttribute('data-csp-nonce', nonce);
    }, []);

    return {
        nonce: securityConfig.nonce()
    };
};

export default useSecurity;
