import React, { createContext } from "react";
import theme from "../theme";
const packageJson = require('../../package.json');

export const AppInfoContext = createContext();

export const AppInfoProvider = ({ children }) => {
    const currentYear = new Date().getFullYear();
    const companyName = "Town Bakers";
    const companyUrl = "https://www.townbakers.in";

    const appInfo = {
        version: packageJson.version,
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
                    onMouseEnter={(e) => (e.target.style.color = theme.palette.primary.main)}
                    onMouseLeave={(e) => (e.target.style.color = "inherit")}
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