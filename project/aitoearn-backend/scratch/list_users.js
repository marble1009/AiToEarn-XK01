const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://admin:password@localhost:27018/?authSource=admin";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("aitoearn");
        const users = await db.collection("users").find({}).toArray();
        console.log("Users found:", JSON.stringify(users, null, 2));
    } finally {
        await client.close();
    }
}

main().catch(console.error);
