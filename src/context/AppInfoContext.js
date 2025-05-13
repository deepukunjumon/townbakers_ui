import React, { createContext } from "react";

export const AppInfoContext = createContext();

export const AppInfoProvider = ({ children }) => {
    const currentYear = new Date().getFullYear();
    const companyName = "Town Bakers";
    const companyUrl = "https://www.townbakers.in";

    const appInfo = {
        version: "1.0.0",
        copyright: (
            <>
                © {currentYear}{" "}
                <a
                    href={companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        textDecoration: "none",
                        color: "inherit",
                        transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#00c3a2")} // Change color on hover
                    onMouseLeave={(e) => (e.target.style.color = "inherit")} // Reset color on mouse leave
                >
                    {companyName}
                </a>
                . All rights reserved.
            </>
        ),
    };

    return (
        <AppInfoContext.Provider value={appInfo}>
            {children}
        </AppInfoContext.Provider>
    );
};