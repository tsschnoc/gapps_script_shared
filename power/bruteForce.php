<?php
$errormessage="";

function connair_send($msg)
{
    echo $msg;    
    
   // IP Adresse ConnAir
   $IP="192.168.1.140";
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

for ($i = 1; $i <= 10; $i++) {
    $vendor="i";         
    $master="A";         
    $slave="1";         
    $version="1";         

    $setaction=$i % 2; 

    echo "\r\n";
    echo "send: ".$vendor.".".$master.".".$slave.".".$version;
    echo "\r\n";
   if ($vendor=="b")
   {
      tx433_brennstuhl($master,$slave,$setaction, $version);
   }
   if ($vendor=="i")
   {
      tx433_intertechno($master,$slave,$setaction, $version);
   }
   sleep(1);
}
   
?>