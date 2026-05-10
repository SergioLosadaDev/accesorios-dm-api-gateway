# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`accesorios-dm-api-gateway` is the API Gateway service for the Accesorios DM application. The `.gitignore` targets Java artifacts (`.class`, `.jar`, `.war`), indicating a Java-based gateway (likely Spring Cloud Gateway or Spring Boot).

## Branch Strategy

The repository uses a three-environment gitflow:

| Branch    | Purpose            |
| --------- | ------------------ |
| `main`    | Production         |
| `qa`      | QA / staging       |
| `develop` | Active development |

Feature branches should be cut from `develop` and merged back via PR. Promotions flow `develop → qa → main`.
