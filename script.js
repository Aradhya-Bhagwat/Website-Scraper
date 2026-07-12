document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const scanForm = document.getElementById("scanForm");
    const urlInput = document.getElementById("urlInput");
    const checkLegal = document.getElementById("checkLegal");
    const checkTax = document.getElementById("checkTax");
    const checkSocial = document.getElementById("checkSocial");
    const checkTech = document.getElementById("checkTech");
    const errorMessage = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");

    const scannerProgress = document.getElementById("scannerProgress");
    const progressBar = document.getElementById("progressBar");
    const currentProgressStep = document.getElementById("currentProgressStep");
    const searchPanel = document.querySelector(".search-panel");
    const resultsDashboard = document.getElementById("resultsDashboard");

    const stepDns = document.getElementById("step-dns");
    const stepMeta = document.getElementById("step-meta");
    const stepCompliance = document.getElementById("step-compliance");
    const stepFinancials = document.getElementById("step-financials");

    const complianceScorePercent = document.getElementById("complianceScorePercent");
    const complianceRatingLabel = document.getElementById("complianceRatingLabel");
    const gaugeValuePath = document.getElementById("gaugeValuePath");
    const riskBadge = document.getElementById("riskBadge");
    const riskMeterVal = document.getElementById("riskMeterVal");
    const riskFactorCount = document.getElementById("riskFactorCount");
    const entityBriefName = document.getElementById("entityBriefName");
    const entityBriefDomain = document.getElementById("entityBriefDomain");

    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");

    const valBrandName = document.getElementById("val-brandName");
    const valMetaTitle = document.getElementById("val-metaTitle");
    const valDescription = document.getElementById("val-description");
    const valEntityType = document.getElementById("val-entityType");
    const valAddress = document.getElementById("val-address");
    const valDomainAge = document.getElementById("val-domainAge");

    const valTaxStatus = document.getElementById("val-taxStatus");
    const valVatNumber = document.getElementById("val-vatNumber");
    const valCinNumber = document.getElementById("val-cinNumber");
    const valPrivacyPolicy = document.getElementById("val-privacyPolicy");
    const valTermsOfService = document.getElementById("val-termsOfService");
    const valSslStatus = document.getElementById("val-sslStatus");
    const legalDocsTableBody = document.getElementById("legalDocsTableBody");

    const valEmailList = document.getElementById("val-emailList");
    const valPhoneList = document.getElementById("val-phoneList");
    const valSocialGrid = document.getElementById("val-socialGrid");

    const techCms = document.getElementById("tech-cms");
    const techPayments = document.getElementById("tech-payments");
    const techAnalytics = document.getElementById("tech-analytics");
    const techSecurity = document.getElementById("tech-security");

    const riskAlertsList = document.getElementById("riskAlertsList");

    const printReportBtn = document.getElementById("printReportBtn");
    const resetScannerBtn = document.getElementById("resetScannerBtn");

    const savedTheme = localStorage.getItem("auditflow-theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("auditflow-theme", newTheme);
    });

    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            tabLinks.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            link.classList.add("active");
            const targetId = link.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");
        });
    });

    scanForm.addEventListener("submit", (e) => {
        e.preventDefault();

        let rawUrl = urlInput.value.trim();
        if (!rawUrl) return;

        if (!/^https?:\/\//i.test(rawUrl)) {
            showError("Invalid URL protocol. Target URL must start with http:// or https://");
            return;
        }

        try {
            const parsed = new URL(rawUrl);
            hideError();
            triggerScanSimulation(parsed);
        } catch (err) {
            showError("Invalid web address syntax. Make sure it is formatted like: https://example.com");
        }
    });

    function showError(msg) {
        errorText.textContent = msg;
        errorMessage.classList.remove("hidden");
    }

    function hideError() {
        errorMessage.classList.add("hidden");
    }

    function triggerScanSimulation(urlObj) {
        searchPanel.classList.add("hidden");
        scannerProgress.classList.remove("hidden");
        resultsDashboard.classList.add("hidden");

        const checklist = [stepDns, stepMeta, stepCompliance, stepFinancials];
        checklist.forEach(item => item.className = "check-item");

        let progress = 0;
        progressBar.style.width = "0%";

        const steps = [
            { limit: 25, text: "Connecting to server and resolving security certificates...", active: stepDns },
            { limit: 50, text: "Extracting site branding, semantic metadata, and titles...", active: stepMeta, done: stepDns },
            { limit: 75, text: "Crawling directories for Privacy Policy & legal terms...", active: stepCompliance, done: stepMeta },
            { limit: 95, text: "Searching footers for GSTIN/VAT registrations & payment rails...", active: stepFinancials, done: stepCompliance },
            { limit: 100, text: "Generating compliance scores and preparing audit summary...", done: stepFinancials }
        ];

        const intervalTime = 35;
        const timer = setInterval(() => {
            progress += 1;
            progressBar.style.width = `${progress}%`;

            const currentStep = steps.find(s => progress <= s.limit);
            if (currentStep) {
                currentProgressStep.textContent = `${progress}% - ${currentStep.text}`;

                if (currentStep.active) {
                    currentStep.active.classList.add("active");
                }
                if (currentStep.done) {
                    currentStep.done.classList.remove("active");
                    currentStep.done.classList.add("done");
                }
            }

            if (progress >= 100) {
                clearInterval(timer);

                checklist.forEach(item => {
                    item.classList.remove("active");
                    item.classList.add("done");
                });

                setTimeout(() => {
                    scannerProgress.classList.add("hidden");
                    renderScrapeResults(urlObj);
                    resultsDashboard.classList.remove("hidden");
                }, 400);
            }
        }, intervalTime);
    }

    function renderScrapeResults(urlObj) {
        const domain = urlObj.hostname.replace("www.", "");
        const cleanName = domain.split('.')[0];
        const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

        let entityType = "Limited Liability Partnership (LLP)";
        let taxCodeLabel = "GSTIN (India)";
        let isIndia = false;

        if (domain.endsWith(".in")) {
            entityType = "Private Limited Company (Pvt. Ltd.)";
            taxCodeLabel = "GSTIN (India)";
            isIndia = true;
        } else if (domain.endsWith(".uk") || domain.endsWith(".co.uk")) {
            entityType = "Private Limited Company (Ltd)";
            taxCodeLabel = "VAT Registration (UK)";
        } else if (domain.endsWith(".co") || domain.endsWith(".com")) {
            entityType = Math.random() > 0.5 ? "Corporation (Inc.)" : "Limited Liability Company (LLC)";
            taxCodeLabel = "EIN / Tax ID (US)";
        }

        const legalChecked = checkLegal.checked;
        const taxChecked = checkTax.checked;
        const socialChecked = checkSocial.checked;
        const techChecked = checkTech.checked;

        let baseScore = 95;
        let riskFactors = [];

        if (!legalChecked) {
            baseScore -= 25;
            riskFactors.push({
                level: "high",
                title: "Legal Audit Excluded",
                desc: "The auditor excluded privacy and terms checking. Corporate legal compliance is unverified."
            });
        }
        if (!taxChecked) {
            baseScore -= 15;
            riskFactors.push({
                level: "med",
                title: "Tax Registration Excluded",
                desc: "Tax registrations were skipped during scan. Verification status: Pending manual audit."
            });
        }
        if (!socialChecked) {
            baseScore -= 5;
        }
        if (!techChecked) {
            baseScore -= 10;
        }

        const hasPrivacy = legalChecked && (Math.random() > 0.15);
        const hasTerms = legalChecked && (Math.random() > 0.2);
        const hasTaxId = taxChecked && (Math.random() > 0.3);
        const hasSSL = Math.random() > 0.05;

        if (legalChecked) {
            if (!hasPrivacy) {
                baseScore -= 20;
                riskFactors.push({
                    level: "high",
                    title: "Missing Privacy Policy",
                    desc: "No valid privacy policy link resolved. GDPR/CCPA compliance has failed."
                });
            }
            if (!hasTerms) {
                baseScore -= 15;
                riskFactors.push({
                    level: "high",
                    title: "Missing Terms & Conditions",
                    desc: "No corporate terms of service found. Client liabilities are unguided by clear agreements."
                });
            }
        }

        if (taxChecked) {
            if (!hasTaxId) {
                baseScore -= 15;
                riskFactors.push({
                    level: "med",
                    title: "No Public Tax Identifiers Discovered",
                    desc: "The footer scan yielded no registered GSTIN/VAT/EIN numbers. Entity legitimacy unverified."
                });
            }
        }

        if (!hasSSL) {
            baseScore -= 30;
            riskFactors.push({
                level: "high",
                title: "Insecure Connection (No SSL/TLS)",
                desc: "Website does not force HTTPS secure protocol. Susceptible to client data hijacking."
            });
        }

        const ageOptions = ["2 years, 4 months", "6 years, 11 months", "11 months", "9 years, 2 months", "14 years, 5 months"];
        const chosenAge = ageOptions[Math.floor(Math.random() * ageOptions.length)];

        let chosenAddress = "72, 5th Main Rd, Koramangala 4th Block, Bengaluru, KA 560034, India";
        if (domain.endsWith(".uk") || domain.endsWith(".co.uk")) {
            chosenAddress = "85 Great Portland Street, First Floor, London, W1W 7LT, United Kingdom";
        } else if (!isIndia && (domain.endsWith(".com") || domain.endsWith(".co"))) {
            chosenAddress = "450 Lexington Ave, New York, NY 10017, United States";
        }

        const finalScore = Math.max(10, Math.min(100, baseScore));

        complianceScorePercent.textContent = `${finalScore}%`;
        gaugeValuePath.setAttribute("stroke-dasharray", `${finalScore}, 100`);

        if (finalScore >= 90) {
            gaugeValuePath.style.stroke = "var(--color-success)";
            complianceRatingLabel.textContent = "Excellent Compliance";
            complianceRatingLabel.style.color = "var(--color-success)";
        } else if (finalScore >= 75) {
            gaugeValuePath.style.stroke = "var(--color-warning)";
            complianceRatingLabel.textContent = "Fair Compliance (Review Needed)";
            complianceRatingLabel.style.color = "var(--color-warning)";
        } else {
            gaugeValuePath.style.stroke = "var(--color-danger)";
            complianceRatingLabel.textContent = "Critical Risk Rating";
            complianceRatingLabel.style.color = "var(--color-danger)";
        }

        let riskWord = "Low Risk";
        let riskClass = "bg-safe";
        let meterValWidth = "12%";
        let barClass = "risk-low";

        if (riskFactors.length > 0) {
            const highCount = riskFactors.filter(r => r.level === "high").length;
            if (highCount >= 2) {
                riskWord = "Critical Risk";
                riskClass = "bg-danger";
                meterValWidth = "90%";
                barClass = "risk-high";
            } else if (highCount === 1 || riskFactors.length >= 2) {
                riskWord = "Medium Risk";
                riskClass = "bg-warning";
                meterValWidth = "55%";
                barClass = "risk-med";
            } else {
                riskWord = "Low Risk";
                riskClass = "bg-safe";
                meterValWidth = "28%";
                barClass = "risk-low";
            }
        }

        riskBadge.textContent = riskWord;
        riskBadge.className = `status-badge ${riskClass}`;
        riskMeterVal.style.width = meterValWidth;
        riskMeterVal.className = `risk-bar ${barClass}`;
        riskFactorCount.textContent = `${riskFactors.length} warning marker${riskFactors.length === 1 ? '' : 's'}`;

        entityBriefName.textContent = `${formattedName} ${entityType.split(' ')[0]}`;
        entityBriefDomain.textContent = domain;

        valBrandName.textContent = formattedName;
        valMetaTitle.textContent = `${formattedName} | Professional Services & Business Systems`;
        valDescription.textContent = `Official site for ${formattedName}. We provide structured commercial offerings, business consulting, infrastructure management, and legal entity support for local and global enterprises.`;
        valEntityType.textContent = entityType;
        valAddress.textContent = chosenAddress;
        valDomainAge.textContent = chosenAge;

        valTaxStatus.textContent = hasTaxId ? "Verified Disclosed" : "Not Disclosed";
        valTaxStatus.className = `data-val badge-status-inline ${hasTaxId ? 'bg-safe' : 'bg-warning'}`;

        let mockVat = "-";
        let mockCin = "-";
        if (hasTaxId) {
            if (isIndia) {
                mockVat = `29AAAC${Math.floor(1000 + Math.random() * 9000)}F1Z${Math.floor(1 + Math.random() * 9)}`;
                mockCin = `U72200KA${Math.floor(2000 + Math.random() * 20)}PTC${Math.floor(100000 + Math.random() * 900000)}`;
            } else if (domain.endsWith(".uk") || domain.endsWith(".co.uk")) {
                mockVat = `GB ${Math.floor(100000000 + Math.random() * 900000000)}`;
                mockCin = `0${Math.floor(10000000 + Math.random() * 90000000)}`;
            } else {
                mockVat = `US ${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000000 + Math.random() * 8999999)}`;
                mockCin = `EIN-${Math.floor(100000 + Math.random() * 899999)}`;
            }
        }
        valVatNumber.textContent = mockVat;
        valCinNumber.textContent = mockCin;

        valPrivacyPolicy.textContent = hasPrivacy ? "Disclosed" : (legalChecked ? "Missing" : "Unverified");
        valPrivacyPolicy.className = `data-val badge-status-inline ${hasPrivacy ? 'bg-safe' : 'bg-danger'}`;

        valTermsOfService.textContent = hasTerms ? "Disclosed" : (legalChecked ? "Missing" : "Unverified");
        valTermsOfService.className = `data-val badge-status-inline ${hasTerms ? 'bg-safe' : 'bg-danger'}`;

        valSslStatus.textContent = hasSSL ? "Secure SSL (SHA-256)" : "Insecure HTTP";
        valSslStatus.className = `data-val badge-status-inline ${hasSSL ? 'bg-safe' : 'bg-danger'}`;

        legalDocsTableBody.innerHTML = `
            <tr>
                <td><strong>Privacy Policy Agreement</strong></td>
                <td><span class="badge-status-inline ${hasPrivacy ? 'bg-safe' : 'bg-danger'}">${hasPrivacy ? 'Resolved' : 'No Endpoint'}</span></td>
                <td>${hasPrivacy ? `<a href="https://${domain}/privacy-policy" target="_blank" class="channel-list link-out">https://${domain}/privacy-policy</a>` : '-'}</td>
            </tr>
            <tr>
                <td><strong>User Terms of Service</strong></td>
                <td><span class="badge-status-inline ${hasTerms ? 'bg-safe' : 'bg-danger'}">${hasTerms ? 'Resolved' : 'No Endpoint'}</span></td>
                <td>${hasTerms ? `<a href="https://${domain}/terms-of-use" target="_blank" class="channel-list link-out">https://${domain}/terms-of-use</a>` : '-'}</td>
            </tr>
            <tr>
                <td><strong>Refund and Dispute Policy</strong></td>
                <td><span class="badge-status-inline ${techChecked && Math.random() > 0.3 ? 'bg-safe' : 'bg-warning'}">${techChecked && Math.random() > 0.3 ? 'Resolved' : 'Default Billing terms applies'}</span></td>
                <td>${techChecked && Math.random() > 0.3 ? `<a href="https://${domain}/refunds" target="_blank" class="channel-list link-out">https://${domain}/refunds</a>` : '-'}</td>
            </tr>
        `;

        const defaultEmails = [`info@${domain}`, `billing@${domain}`];
        if (socialChecked && Math.random() > 0.3) {
            defaultEmails.push(`support@${domain}`);
        }
        valEmailList.innerHTML = defaultEmails.map(email => `
            <li>
                <span>${email}</span>
                <a href="mailto:${email}" class="link-out">Mail</a>
            </li>
        `).join("");

        const defaultPhones = [`+1 (800) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`];
        if (isIndia) {
            defaultPhones[0] = `+91 ${Math.floor(70000 + Math.random() * 30000)} ${Math.floor(10000 + Math.random() * 90000)}`;
        }
        valPhoneList.innerHTML = defaultPhones.map(phone => `
            <li>
                <span>${phone}</span>
                <a href="tel:${phone.replace(/\s+/g, '')}" class="link-out">Call</a>
            </li>
        `).join("");

        const socials = [
            { name: "LinkedIn", url: `https://linkedin.com/company/${cleanName}`, icon: "fa-brands fa-linkedin-in" },
            { name: "Twitter", url: `https://twitter.com/${cleanName}`, icon: "fa-brands fa-twitter" },
            { name: "Facebook", url: `https://facebook.com/${cleanName}`, icon: "fa-brands fa-facebook-f" }
        ];

        valSocialGrid.innerHTML = socials.map(s => `
            <a href="${s.url}" target="_blank" class="social-pill">
                <i class="${s.icon} social-icon"></i>
                <span>${s.name}</span>
            </a>
        `).join("");

        let cmsPills = ["HTML5", "CSS3 / Sass", "React / NextJS"];
        let paymentPills = ["None Discovered"];
        let analyticsPills = ["Google Tag Manager", "Google Analytics 4"];
        let securityPills = ["Cloudflare CDN", "Let's Encrypt CA Certificate"];

        if (techChecked) {
            cmsPills = Math.random() > 0.4 ? ["WordPress 6.4", "PHP 8.2", "MySQL"] : ["Custom React Engine", "NextJS Production", "Vercel Host Edge"];
            paymentPills = Math.random() > 0.5 ? ["Stripe Connect", "PayPal Express Checkout"] : ["Razorpay Billing Gateway", "Cashfree Rails"];
            analyticsPills = ["GA4 Tracker", "Hotjar UX Analytics", "Facebook Pixel"];
            securityPills = ["HSTS Security Headers Enabled", "Cloudflare WAF Firewall Protection", "AWS Route 53 DNS Resolver"];
        }

        techCms.innerHTML = cmsPills.map(p => `<span class="tech-pill">${p}</span>`).join("");
        techPayments.innerHTML = paymentPills.map(p => `<span class="tech-pill">${p}</span>`).join("");
        techAnalytics.innerHTML = analyticsPills.map(p => `<span class="tech-pill">${p}</span>`).join("");
        techSecurity.innerHTML = securityPills.map(p => `<span class="tech-pill">${p}</span>`).join("");

        if (riskFactors.length === 0) {
            riskAlertsList.innerHTML = `
                <div class="risk-alert-item risk-low">
                    <i class="fa-solid fa-circle-check risk-item-icon"></i>
                    <div class="risk-item-details">
                        <h5>No Regulatory Non-Compliance Flagged</h5>
                        <p>This website meets all critical disclosure criteria checked. Domain SSL is fully secure, company policies exist, and basic tax indices are present.</p>
                    </div>
                </div>
            `;
        } else {
            riskAlertsList.innerHTML = riskFactors.map(rf => `
                <div class="risk-alert-item risk-${rf.level}">
                    <i class="fa-solid fa-triangle-exclamation risk-item-icon"></i>
                    <div class="risk-item-details">
                        <h5>${rf.title}</h5>
                        <p>${rf.desc}</p>
                    </div>
                </div>
            `).join("");
        }

        document.getElementById("printDatePlaceholder").textContent = new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById("print-domain-target").textContent = urlObj.href;
        document.getElementById("print-score-val").textContent = `${finalScore}%`;
        document.getElementById("print-risk-val").textContent = riskWord;

        document.getElementById("print-brand").textContent = formattedName;
        document.getElementById("print-structure").textContent = entityType;
        document.getElementById("print-address").textContent = chosenAddress;
        document.getElementById("print-age").textContent = chosenAge;

        document.getElementById("print-cin").textContent = mockCin;
        document.getElementById("print-vat").textContent = mockVat;
        document.getElementById("print-ssl").textContent = hasSSL ? "Secure SHA-256 Enabled" : "Insecure HTTP Protocol";
        document.getElementById("print-privacy").textContent = hasPrivacy ? "Active Resolved" : (legalChecked ? "Failed / Missing" : "Excluded");
        document.getElementById("print-terms").textContent = hasTerms ? "Active Resolved" : (legalChecked ? "Failed / Missing" : "Excluded");

        document.getElementById("print-emails").textContent = defaultEmails.join(", ");
        document.getElementById("print-phones").textContent = defaultPhones.join(", ");
        document.getElementById("print-socials").textContent = socials.map(s => s.name).join(", ");

        const printRisksList = document.getElementById("print-risks-list");
        if (riskFactors.length === 0) {
            printRisksList.innerHTML = `<li><strong>No Actionable Risks:</strong> The client website meets the necessary criteria for active public company profiles.</li>`;
        } else {
            printRisksList.innerHTML = riskFactors.map(rf => `
                <li><strong>[${rf.level.toUpperCase()}] ${rf.title}:</strong> ${rf.desc}</li>
            `).join("");
        }
    }

    printReportBtn.addEventListener("click", () => {
        window.print();
    });

    resetScannerBtn.addEventListener("click", () => {
        resultsDashboard.classList.add("hidden");
        searchPanel.classList.remove("hidden");
        urlInput.value = "";
        urlInput.focus();
    });

    const brandLogo = document.querySelector(".brand");
    brandLogo.addEventListener("click", () => {
        resultsDashboard.classList.add("hidden");
        scannerProgress.classList.add("hidden");
        searchPanel.classList.remove("hidden");
        urlInput.value = "";
        urlInput.focus();
    });

});