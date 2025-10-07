#!/usr/bin/env tsx

import inquirer from "inquirer";
import chalk from "chalk";
import minimist from "minimist";
import ora from "ora";
import { RDAPClient } from "@/utils/rdap-client.utils";
import type { RDAPResponse } from "@/types";
import { domainExists, siteIsReachable } from "@/utils/domain.utils";

const client = new RDAPClient({
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    randomizeHeaders: true,
});

const logHeader = (title: string) =>
    console.log(`\n${chalk.cyan.bold(`• ${title}`)}`);
const logJSON = (data: any) =>
    console.log(chalk.gray(JSON.stringify(data, null, 2)));

const actions: Record<string, (r: RDAPResponse) => void> = {
    "📊 Formatted Response": (r) => {
        logHeader("Formatted Response");
        console.log(client.formatResponse(r));
    },
    "✅ Raw Response": (r) => {
        logHeader("Raw Response");
        logJSON(r);
    },
    "🧩 Nameservers": ({ nameservers }) => {
        if (!nameservers?.length)
            return console.log(chalk.yellow("No nameservers found."));
        logHeader("Nameservers");
        nameservers.forEach((ns) => console.log(`  - ${chalk.green(ns.ldhName)}`));
    },
    "📌 Key Information": (r) => {
        logHeader("Key Information");
        console.log(`Domain: ${chalk.green(r.ldhName)}`);
        console.log(`Status: ${chalk.blue(r.status?.join(", ") || "Unknown")}`);
    },
    "👤 Contacts": (r) => {
        if (!r.entities?.length)
            return console.log(chalk.yellow("No contacts found."));
        logHeader("Contacts");
        r.entities.forEach((entity) => {
            const contact = client.parseVCard(entity);
            console.log(
                `  ${chalk.magenta(entity.roles?.join(", ") || "Unknown")}: ${
                    contact.fullName || contact.organization || "N/A"
                }`,
            );
        });
    },
    "🕒 Events": (r) => {
        if (!r.events?.length) return console.log(chalk.yellow("No events found."));
        logHeader("Events");
        r.events.forEach((event) =>
            console.log(
                `  ${chalk.cyan(event.eventAction)}: ${new Date(event.eventDate).toLocaleString()}`,
            ),
        );
    },
};

const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;

async function main() {
    console.clear();
    console.log(chalk.bold.greenBright("🔍 RDAP CLI Utility\n"));

    const args = minimist(process.argv.slice(2));
    let domain = args.domain || args.d;

    if (domain === true) domain = undefined;

    if (!domain) {
        const answer = await inquirer.prompt([
            {
                type: "input",
                name: "domain",
                message: "Enter a domain to query:",
                validate: (v: string) => {
                    if (!v) return "Domain is required";
                    if (!domainRegex.test(v.trim()))
                        return "Please enter a valid domain (e.g., example.com)";
                    return true;
                },
            },
        ]);
        domain = answer.domain;
    }

    const cleanDomain = domain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

    if (!domainRegex.test(cleanDomain)) {
        console.error(chalk.red(`❌ Invalid domain: ${cleanDomain}`));
        process.exit(1);
    }

    const spinner = ora(`Checking domain ${cleanDomain}...`).start();

    if (
        !(await domainExists(cleanDomain)) ||
        !(await siteIsReachable(cleanDomain))
    ) {
        spinner.fail(`Domain ${cleanDomain} not found or unreachable.`);
        process.exit(1);
    }

    spinner.succeed(`Domain ${cleanDomain} resolved successfully.`);

    const result = await client.queryDomain(cleanDomain);
    spinner.succeed(`Fetched data for ${chalk.green(cleanDomain)}.\n`);

    const { selectedAction } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedAction",
            message: "Choose what you want to view:\n",
            choices: Object.keys(actions),
        },
    ]);

    console.log(chalk.gray("\n─────────────────────────────"));
    actions[selectedAction](result);
    console.log(chalk.gray("─────────────────────────────\n"));
}

main().catch((error) => {
    console.error(chalk.redBright("\n❌ Error:"), error.message || error);
});
