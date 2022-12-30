<?php

    $to = 'david.bern.pal@gmail.com';
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    $header = "Mensaje enviado desde la web";

    if(mail($to, $header, $message)) {
        echo 'El correo se ha enviado correctamente';
    } else {
        echo 'El correo no ha podido enviarse';
    }

   echo "<script>console.log('{$message}');</script>";