<?php

/**
 * Flatten a multi-dimensional array
 */
function array_flatten( array $array, $prefix = '', $delimiter = '.' ) { 

  $result = []; 
  
  foreach ( $array as $key => $value ) { 
    
    if ( is_array($value) ) { 
      
      $result = array_merge($result, array_flatten($value, $key.$delimiter)); 
    
    } 
    
    else { 
      
      $result[$prefix.$key] = $value; 
      
    } 
    
  } 
  
  return $result; 
  
}

/**
 * Determine whether an array is associative (containing non-interger keys)
 */
function is_associative_array( array $array ) {
  
  foreach( array_keys($array) as $key ) {
    
    if( is_string($key) ) return true;
    
  }
  
  return false;
  
}

?>