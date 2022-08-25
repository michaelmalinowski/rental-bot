const RentalBot = require('./RentalBot');
const replyInfo = {
    "name": "Michael Malinowski",
    "email": "mike.m7@hotmail.com",
    "message": "Hi there,\\n\\nI am highly interested in your listing. I am looking to let for myself; Michael Malinowski, a 26-year-old male working as a software engineer. Alongside my partner, Gina Nguyen, a 26-year-old female studying medicine at UCD. In summary: two adults with zero dependents looking for a 1-2 year lease.\\n\\nWe are currently in Canada until August 31st however our friend can attend a viewing on my behalf (Aubrie Sowa: 087 117 6999).\\n\\nWe are happy to sign a lease remotely afterward, with the required deposit and first and last months' rent. Should you like to discuss further (ie. increased rent offer) via phone in the meantime, my number on Whatsapp is (Canada:+1) 647202875. \\n\\nAll my best,\\nMichael"
}


bot = new RentalBot('mike.m7@hotmail.com', '%wNUUqpJw-HfEc7', 1)
bot.setReplyInfo(replyInfo)
bot.run()