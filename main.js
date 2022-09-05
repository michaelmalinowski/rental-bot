const RentalBot = require('./RentalBot');
const replyInfo = {
    "name": "Michael Malinowski",
    "email": "mike.m7@hotmail.com",
    "message": "Hi there,\\n\\nI am highly interested in your listing. I am looking to let for myself; Michael Malinowski, a 26-year-old male working as a software engineer. Alongside my partner, Gina Nguyen, a 26-year-old female studying medicine at UCD. In summary: two adults with zero dependents looking for a 1-2 year lease.\\n\\nWe are available for a viewing anytime after September 5th. Please let us know via email or phone when viewings start. We are very eager to move forward with the letting process. Also let us know if you would need anything else from us.\\n\\nAll my best,\\nMichael"
}


bot = new RentalBot('mike.m7@hotmail.com', '%wNUUqpJw-HfEc7', 1)
bot.setReplyInfo(replyInfo)
bot.run()