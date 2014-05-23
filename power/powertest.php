<?php
// Licht & Strom 
// Web-Schaltapplikation fuer ConnAir   
// Version 0.1 (24.11.2012)
// unterstützte Steckdosen
// - brennstuhl RCS 1000N (Version 1: ca. 2009, Version 2: 2012)
// - intertechno PAR-1000 (Version 1: ca 2006)


// Konfiguration
// **************
//
// Array mit Konfigurationsdaten
// Format: 
// [Hersteller]-[Master]-[Slave]-[Version]
// Hersteller (i = intertechno, b = brennstuhl)
// für brennstuhl RCS 1000N:
//    dip switches 12345-ABCDE zB. 
//     b-10010-00100-1 => Brennstuhl, 12345 (Master) = 10010, ABCDE (Slave) = 00100 (==C), Version = 1
//      version 1=brennstuhl 2009,  2=brennstuhl 2012
// für intertechno PAR-1000, Master A-D, Slave 1-3, zB. 
//      i-C-2-1 für intertechno Steckdose mit Code C2
//      version = 1 (andere habe ich nicht)


$steckdose = array(
   "Licht 1 Wohnzimmer" => "b-10011-00100-1", 
   "Licht 2 Wohnzimmer" => "b-10011-01000-1",
   "Licht 3 Wohnzimmer" => "b-10011-10000-1", 
   "Licht 1 Arbeitszimmer" => "i-A-1-1",  
   "Licht 2 Arbeitszimmer " => "i-A-2-1",    
   "Licht 3 Arbeitszimmer" => "i-A-3-1",
   "Strom PC" => "b-10111-01000-2",
   "Strom Drucker" => "b-10111-00100-2",
   "Strom TV" => "b-10111-10000-2"
    );
    

$errormessage="";
   

function connair_send($msg)
{
   // IP Adresse ConnAir
   $IP="192.168.123.100";
   $PORT=49880;
   
   $sock = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
   $len = strlen($msg);

   if($sock) {
      socket_sendto($sock, $msg, $len, 0, $IP, $PORT);
      socket_close($sock);
   }
   else {
      $errormessage= "Kann ConnAir nicht erreichen IP:PORT=".$IP.":".$PORT."\n";
   }
      
}


function tx433_brennstuhl($Master,$Slave,$onoff,$tx433version)
{   
   $sA=0;
   $sG=0;
   $sRepeat=10;
   $sPause=5600;
   $sTune=350;
   $sBaud=25;
   $sSpeed=16;
   
   $uSleep=800000;
   if ($tx433version==1) $txversion=3;
   else $txversion=1;
   
   $HEAD="TXP:$sA,$sG,$sRepeat,$sPause,$sTune,$sBaud,";
   $TAIL=",$txversion,1,$sSpeed,;";
   $AN="1,3,1,3,3";
   $AUS="3,1,1,3,1";
   
   $bitLow=1;
   $bitHgh=3;
   
   $seqLow=$bitHgh.",".$bitHgh.",".$bitLow.",".$bitLow.",";
   $seqHgh=$bitHgh.",".$bitLow.",".$bitHgh.",".$bitLow.",";

   $bits=$Master;
   $msg="";
   for($i=0;$i<strlen($bits);$i++) {   
      $bit=substr($bits,$i,1);
      if($bit=="0")
         $msg=$msg.$seqLow;
      else
         $msg=$msg.$seqHgh;
   }
   $msgM=$msg;
   $bits=$Slave;
   $msg="";
   for($i=0;$i<strlen($bits);$i++) {
      $bit=substr($bits,$i,1);
      if($bit=="0")
         $msg=$msg.$seqLow;
      else
         $msg=$msg.$seqHgh;
   }

   $msgS=$msg;
   $msg_ON=$HEAD.$bitLow.",".$msgM.$msgS.$bitHgh.",".$AN.$TAIL;
   $msg_OFF=$HEAD.$bitLow.",".$msgM.$msgS.$bitHgh.",".$AUS.$TAIL;
   
   if($onoff==1){ $msg=$msg_ON;}
   else $msg=$msg_OFF;
   connair_send($msg);
}   

function tx433_intertechno($Master,$Slave,$onoff,$tx433version)
{
   $sA=0;
   $sG=0;
   $sRepeat=6;
   $sPause=11125;
   $sTune=89;
   $sBaud=25;
   $sSpeed=125;
   
   $uSleep=800000;
   
   $HEAD="TXP:$sA,$sG,$sRepeat,$sPause,$sTune,$sBaud,";
   $TAIL=",1,$sSpeed,;";
   $AN="12,4,4,12,12,4";
   $AUS="12,4,4,12,4,12";
   
   $bitLow=4;
   $bitHgh=12;
   
   $seqLow=$bitHgh.",".$bitHgh.",".$bitLow.",".$bitLow.","; 
   $seqHgh=$bitHgh.",".$bitLow.",".$bitHgh.",".$bitLow.",";
   
   $msgM="";

   switch ($Master){
      case "A":
         $msgM=$seqHgh.$seqHgh.$seqHgh;
         break;
      case "B":
         $msgM=$seqLow.$seqHgh.$seqHgh;
         break;    
      case "C":
         $msgM=$seqHgh.$seqLow.$seqHgh;
         break;  
      case "D":
         $msgM=$seqLow.$seqLow.$seqHgh;
         break;
   }

   $msgS="";   
   switch ($Slave){
      case "1":
         $msgS=$seqHgh.$seqHgh.$seqHgh;
         break;
      case "2":
         $msgS=$seqHgh.$seqLow.$seqHgh;
         break;    
      case "3":
         $msgS=$seqHgh.$seqHgh.$seqLow;
         break;  
   }
   
   $msg_ON=$HEAD.$bitLow.",".$msgM.$msgS.$seqHgh.$seqHgh.$seqHgh.$seqLow.$bitHgh.",".$AN.$TAIL;
   $msg_OFF=$HEAD.$bitLow.",".$msgM.$msgS.$seqHgh.$seqHgh.$seqHgh.$seqLow.$bitHgh.",".$AUS.$TAIL;
   
   if($onoff==1){ $msg=$msg_ON;}
   else $msg=$msg_OFF;
   connair_send($msg);
}   


// main

if (isset($_POST['submit']))
{
   if (($_POST['submit'])=="submit_on") { $setaction=1; }
   else { $setaction=0;}
         
   if ($_POST['vendor']=="b")
   {
      tx433_brennstuhl($_POST['master'],$_POST['slave'],$setaction, $_POST['version']);
   }
   if ($_POST['vendor']=="i")
   {
      tx433_intertechno($_POST['master'],$_POST['slave'],$setaction, $_POST['version']);
   }
}


// alles aus
if (isset($_POST['allesaus']))
{
   foreach ($steckdose as $i => $value) {
         $vendorcode=substr($value, 0,1);
         switch ($vendorcode){
            case "i":
               $masterdip=substr($value, 2, 1);
               $slavedip=substr($value, 4, 1);
               $tx433version=substr($value, 6, 1);
               break;
            case "b";
               $masterdip=substr($value, 2, 5);
               $slavedip=substr($value, 8, 5);
               $tx433version=substr($value, 14, 1);
               break;
            // more vendors to add..
         }      
         $setaction=0;
         // wenn brennstuhl
         if ($vendorcode=="b")
            {
               tx433_brennstuhl($masterdip,$slavedip,$setaction,$tx433version);
            }
         // wenn intertechno
         if ($vendorcode=="i")
            {
               tx433_intertechno($masterdip,$slavedip,$setaction);
            }
         sleep (1);
         }

}


?>
<!DOCTYPE html> 
<html> 
<head> 
   <title>Licht &amp; Strom</title> 
   <link rel="stylesheet" href="http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.css" />
   <script src="http://code.jquery.com/jquery-1.8.2.min.js"></script>
   <script src="http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.js"></script>
   <meta name="viewport" content="320.1, initial-scale=1.0">
   <meta name="apple-mobile-web-app-capable" content="yes">
</head> 
</head> 
<body> 

<div data-role="page">

   <div data-role="header">
      <h1>Licht &amp; Strom</h1>
   </div><!-- /header -->

   <div data-role="content" align="center">   
      <div data-role="collapsible-set">
   <?php
      foreach ($steckdose as $i => $value) {
      $vendorcode=substr($value, 0,1);
      switch ($vendorcode){
         case "i":
            $masterdip=substr($value, 2, 1);
            $slavedip=substr($value, 4, 1);
            $tx433version=substr($value, 6, 1);
            break;
         case "b";
            $masterdip=substr($value, 2, 5);
            $slavedip=substr($value, 8, 5);
            $tx433version=substr($value, 14, 1);
            break;
         // more vendors to add..
      }      
   
      
   ?>
      <div data-role="collapsible" data-theme="a" data-content-theme="d">
         <h3><?php echo $i; ?></h3>
         <p>
         <form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="post" data-ajax="false">
            <button type="submit" name="submit" value="submit_on" data-theme="a" data-icon="star" data-inline="true">Ein</button>
            <button type="submit" name="submit" value="submit_off" data-theme="a" data-icon="star" data-inline="true">Aus</button>
            <input type="hidden" name="vendor" value="<?php echo $vendorcode; ?>">
            <input type="hidden" name="master" value="<?php echo $masterdip; ?>">
            <input type="hidden" name="slave" value="<?php echo $slavedip; ?>">
            <input type="hidden" name="version" value="<?php echo $tx433version; ?>">
         </form>
         </p>
      </div>
   <?php
   }
   ?>
      </div>
   <br>
   <br>
   <br>
   <br>
   <br>
   <br>
   <br>
   <br>
   
   <div align="center">   
         <form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="post" data-ajax="false">
         <button type="submit" name="allesaus" value="allesaus" data-theme="b" data-icon="delete" >Alles aus</button>
      </form>
   </div>
   
   <?php echo $errormessage; ?></p>
   </div><!-- /content -->

</div><!-- /page -->
</body>
</html>