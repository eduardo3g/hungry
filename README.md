<!-- <p align="center">
   <img alt="Twitter logo" src="./.github/docs/images/logo.png" width="150px" />
</p> -->


<h1 align="center" style="margin-top:30px">
  Hungry 🍲
</h1>

<p align="center">Food ordering software for restaurants to delivery delicious food.</p>

<p align="center" style="margin-top:15px">

  [![Author](https://img.shields.io/badge/author-eduardo3g-1da1f2?style=flat-square)](https://github.com/eduardo3g)
  [![Languages](https://img.shields.io/github/languages/count/eduardo3g/hungry?color=%1da1f2&style=flat-square)](#)
  [![Stars](https://img.shields.io/github/stars/eduardo3g/hungry?color=1da1f2&style=flat-square)](https://github.com/eduardo3g/hungry/stargazers)
</p>

# 📚 Introduction

This project was built on top of the main Serverless managed services from AWS. It follows an event-driven architecture and patterns of production-ready applications.<br/>

The entire application was built using Cloud-Native services provided by AWS.

# 👨🏽‍🔧 Tech stack

* 🏡 <a href="https://aws.amazon.com/api-gateway/">AWS API Gateway</a> - a fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale.
* 👷🏻 <a href="https://www.google.com/aclk?sa=L&ai=DChcSEwi65ZOUsO_wAhVBgJEKHUiuDwIYABABGgJjZQ&ae=2&sig=AOD64_1WI4JrkomIsRl4pzEy7HCKyY1qNQ&q=&ved=2ahUKEwjKh4yUsO_wAhWCJ7kGHYXxB8oQqyQoAHoECAEQEQ&adurl=">AWS Lambda</a> - serverless compute service that lets you run code without provisioning or managing servers, creating workload-aware cluster scaling logic, maintaining event integrations, or managing runtimes.
* 🌉 <a href="https://aws.amazon.com/eventbridge/">Event Bridge</a> - serverless event bus that ingests data from your own apps, SaaS apps and AWS services and routes that data to targets.
* 🔔 <a href="https://aws.amazon.com/sns/">SNS</a> - a fully managed service, taking care of the heavy lifting related to capacity planning, provisioning, monitoring, and patching.
* 🤫 <a href="https://aws.amazon.com/kms/">KMS</a> - a service that makes it easy for you to create and manage cryptographic keys and control their use across a wide range of AWS services and in your applications.
* 🔑 <a href="https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html">SSM Parameter Store</a> - a provides secure, hierarchical storage for configuration data management and secrets management.
* 🗃️ <a href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html">AWS DynamoDB</a> - fully managed NoSQL database service that provides fast and predictable performance with seamless scalability.
* 👮🏻 <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html">AWS Cognito</a> - provides authentication, authorization, and user management for your web and mobile apps.
* 🍃 <a href="https://www.serverless.com/">Serverless Framework</a> - framework that speeds up the development of Serverless cloud-native applications.

# 🖥️ Features

* Get static web page by accessing the root endpoint (/)
* User registration
* Sign in
* Sign out
* Get all the restaurants
* Search for a specific restaurant
* Place an order
* Notify the restaurant when a new order is created

Sounds fun, right? 🤟

# ✔️ Requirements
* Node.js 12.x+
* AWS account
* AWS IAM user with administrator role and programmatic access (access key id and access secret key)
* <a href="https://lumigo.io/">Lumigo</a> account - grab the tracer token from your account settings

# ⚙️ Deploying the app
* Get the tracing token from Lumigo
  - Open Lumigo (I assume you already have an account)
  - Click on Settings > Tracing
  - Get the `Manual tracing` token
* Configure an SSM Parameter on AWS to store Lumigo's token
  - Open the AWS Console
  - Select the `Systems Manager` (aka. SSM) service
  - Select `Parameter Store` on the left menu
  - Create a new parameter
  - Name this parameter as `/lumigo/tracing-token` (it must have this name)
  - Paste the tracing token from Lumigo on the value field and hit save

* Deploy the stack
```
# Clone this repository
git clone https://github.com/eduardo3g/hungry.git

# Move yourself to the root directory
cd hungry

# Install the dependencies with NPM
npm install

# Deploy the stack (by detault it'll create a 'dev' stack)
npx sls deploy

# Grab the API URL on the terminal output
```

# 🌱 Seeding the database

Run the following command to seed restaurants to DynamoDB:

```
# Generate a .env file on your root directory
npm run exportEnv

# Seed the database
cd util

# It'll create 8 items on the Restaurants table on DynamoDB
node seed-restaurants.js
```

# 🐞 Issues

Feel free to <b>create a new issue</b> with an detailed title and description. If you already have a solution to fix the problem, I would be very happy to <b>review your pull request</b>.

# 🎉 Contributing

I'm highly opened to contributions and would love to review pull requests to make this project even better.
