<?php

    $to = 'david.bern.pal@gmail.com';
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    $header = "Mensaje enviado desde la web";
    //$completeMessage = "De: ".$name."\nEmail: ".$email."\n\nMensaje: ".$message;

    mail($to, $header, $message);

   echo "<script>console.log('{$message}');</script>";