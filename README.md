# OCR-APP

Using this application you can Scan Thai ID cards using Google Cloud Vision API and get following information 

<ul>
<li>Identification Number
<li>Name
<li>Last Name
<li>Date of Birth
<li>Date of Issue
<li>Date of Expiry
</ul>

To use this application, you will need following things

<ul>
<li>Cloud Vision Credentials to use the API
</ul>

Here are the steps in which you can access the application after you have successfully added your credentials path in main.py

<ul>
<li> cd into the server folder and run - python main.py into the terminal which will start your development server
<li> cd into the source folder and run - npm run dev into the terminal which will start your React client
</ul>

On the main page, click on no file chosen and select the image, after the image is selected click on Upload. You will see the results on the right panel like this
![Main Page](image.png)

Click on Save Button to save the details into the database.(MongoDB)

After Saving navigate to /data endpoint which is the <strong>OCR Management Console</strong>, where you can Create,Update,Delete and Read all the OCR Results available in the Database. 

![OCR Data Management](image-1.png)