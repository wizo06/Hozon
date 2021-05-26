# Step 1: Install RabbitMQ

The official documentation can be found [here](https://www.rabbitmq.com/download.html).

## RabbitMQ server on Ubuntu 20.04

If you plan to run the RabbitMQ server on Ubuntu 20.04 specifically, you can skip the official documentation and just run the included `install.sh` script instead. The instructions were extracted from the official documentation.
```
chmod 700 install.sh
./install.sh
```

# Step 2: Start the RabbitMQ Server
```
sudo service rabbitmq-server start
```

# Step 3: (Optional) Enable Management UI (web-based dashboard)
```
sudo rabbitmq-plugins enable rabbitmq_management
```

# Step 4: (Optional) Create a user
```
sudo rabbitmqctl add_user <username> <password>
```

# Step 5: (Optional) Tag the user with "administrator" for full Management UI access
```
sudo rabbitmqctl set_user_tags <username> administrator
```

# Step 6: (Optional) Set permissions for the user
```
sudo rabbitmqctl set_permissions -p "/" <username> ".*" ".*" ".*"
```

# Step 7: (Optional) Access the Management UI in the browser
```
http://localhost:15672
```

# Step 8: Create an Exchange and a Queue, and then Bind them together

![](../../diagram.png)

Producers "publish" messages to an "Exchange". This "Exchange" then routes those messages to "Queue(s)" that are bound to the "Exchange". The connection between an "Exchange" and a "Queue" is called a "Binding", and it's defined by a keyword. This keyword allows the "Exchange" to know which "Queue" it should distribute the messages to. The Worker can then attach to a specific "Queue" to accept the messages it's intended to receive.

With this in mind, we can proceed with the rest of this step.

There are two options:

## Option A (recommended)

Step 1: Create a config file called `config.toml` by making a copy of `template.toml`

The script will pull configuration data from the `config.toml` file to setup the Exchange, Queue, and Binding. If you wish to make any changes to the configuration, do so now.

Step 2: Run the included `createAndBind.js` script.
```
node createAndBind.js
```

## Option B
Assuming you did step 2~7, you can create an Exchange and a Queue in the Management UI, and then Bind them together.

### Create Exchange
These are the fields you need to fill out.

- Name: set it to any name you want
- Type: set it to `direct`
- Durability: set it to `Durable`
- Auto delete: set it to `No`
- Internal: set it to `No`
- Arguments: leave it empty

Click on "Add exchange" button

### Create Queue
These are the fields you need to fill out.

- Type: set it to `Classic`
- Name: set it to any name you want
- Durability: set it to `Durable`
- Auto delete: set it to `No`
- Arguments: leave it empty

Click on "Add queue" button

### Create Binding
Click on the Exchange (or Queue) you just created.

- To queue (or From exchange): set it to the queue (or exchange) you just created
- Routing key: set it to any string you want
- Arguments: leave it empty

Click on "Bind" button

