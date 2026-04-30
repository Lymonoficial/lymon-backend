"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cypress_1 = require("cypress");
const webpack_preprocessor_1 = __importDefault(require("@cypress/webpack-preprocessor"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function loadEnv() {
    const envPath = path_1.default.join(__dirname, '.env');
    if (!fs_1.default.existsSync(envPath))
        return {};
    const env = {};
    const content = fs_1.default.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();
            env[key.trim()] = value;
        }
    });
    return env;
}
const envVars = loadEnv();
exports.default = (0, cypress_1.defineConfig)({
    e2e: {
        specPattern: 'cypress/security/**/*.cy.ts',
        supportFile: 'cypress/support/index.ts',
        video: false,
        screenshotOnRunFailure: false,
        requestTimeout: 10000,
        responseTimeout: 10000,
        setupNodeEvents(on) {
            on('file:preprocessor', (0, webpack_preprocessor_1.default)({
                webpackOptions: {
                    resolve: { extensions: ['.ts', '.js'] },
                    module: {
                        rules: [
                            {
                                test: /\.ts$/,
                                use: [
                                    {
                                        loader: 'ts-loader',
                                        options: {
                                            configFile: path_1.default.resolve(__dirname, 'cypress/tsconfig.json'),
                                            transpileOnly: true,
                                        },
                                    },
                                ],
                                exclude: /node_modules/,
                            },
                        ],
                    },
                },
            }));
        },
    },
    env: {
        BASE_URL: process.env.BASE_URL || envVars.BASE_URL || 'http://localhost:3000',
        AUTH_EMAIL: process.env.AUTH_EMAIL || envVars.AUTH_EMAIL,
        AUTH_PASSWORD: process.env.AUTH_PASSWORD || envVars.AUTH_PASSWORD,
        PROPERTY_ID: process.env.PROPERTY_ID || envVars.PROPERTY_ID,
    },
});
//# sourceMappingURL=cypress.config.js.map