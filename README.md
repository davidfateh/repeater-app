# Global Settings App

The Global settings app creates list of key-value pairs in the Contentful web app by using templates that you select on the screen.
Key-value pairs are two pieces of associated information such as:



The Repeater app utilizes the Contentful [JSON Field](https://www.contentful.com/developers/docs/concepts/data-model/#:~:text=JSON%20Object) to store a simple `Item` data stucture:

```ts
{
    id: string; // automatically generated by the app
    key: string;
    value: string[];
}
```

*Note that the `id` property is automatically generated and useful for developers
to differentiate between different list items even if the labels are the same or similar*

An example item in the Contentful response:

```json
{
    "fields": {
        "jsonField": [
            {
                "id": "fisgh9s8e-sdfhap832",
                "key": "returns-settings-cta-text",
                "value": ["Returns FAQ"]
            },
            {
                "id": "asd7f82eiSUHDU-F0sudh4",
                "key": "returns-settings-cta-text",
                "value": ["/returns-center-faq"]
            }
        ]
    }
}
```

## Running This App Locally

> This project was bootstrapped with [Create Contentful App](https://github.com/contentful/create-contentful-app).

Before running the app locally, you will need to do 2 things:
* Ensure your Contentful user is admin or developer for the organization.
* Create an [`AppDefinition`](https://www.contentful.com/developers/docs/extensibility/app-framework/app-definition/)
in your organization with the following properties:
    * The App URL: http://localhost:3000
    * An entry field location with a type of JSON Object

If you are using the UI to create the `AppDefinition`, it should look like this:

![Repeater App Definition UI](./assets/repeater-appdefinition.png)


Once your app definition is created, running `npm run start` will start a local server on
port 3000 (http://localhost:3000).

You must create or modify a content type which has a JSON field in order to see the app
inside of the Contentful web app.

## Learn More

[Read more](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/) and check out the video on how to use the CLI.

Create Contentful App uses [Create React App](https://create-react-app.dev/). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started) and how to further customize your app.
