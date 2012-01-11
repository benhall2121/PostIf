<?php
if( is_uploaded_file($_FILES['browseFile']['tmp_name']) ) {

   $fileType      = $_FILES['browseFile']['type']; // Extension without starting dot
   $filePathName  = $_FILES['browseFile']['tmp_name']; // Path to the file

   echo "data:"
         . $fileType 
         . ";base64," 
         . base64_encode( file_get_contents( $filePathName ) );

   unlink( $filePathName );
}
?>