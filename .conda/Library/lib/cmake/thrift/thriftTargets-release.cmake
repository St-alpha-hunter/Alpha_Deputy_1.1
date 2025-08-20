#----------------------------------------------------------------
# Generated CMake target import file for configuration "Release".
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "thrift::thrift" for configuration "Release"
set_property(TARGET thrift::thrift APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(thrift::thrift PROPERTIES
  IMPORTED_IMPLIB_RELEASE "D:/desktop/practice_dom/FINSHARK/Alpha-Deputy/.conda/Library/lib/thriftmd.lib"
  IMPORTED_LOCATION_RELEASE "D:/desktop/practice_dom/FINSHARK/Alpha-Deputy/.conda/Library/bin/thriftmd.dll"
  )

list(APPEND _cmake_import_check_targets thrift::thrift )
list(APPEND _cmake_import_check_files_for_thrift::thrift "D:/desktop/practice_dom/FINSHARK/Alpha-Deputy/.conda/Library/lib/thriftmd.lib" "D:/desktop/practice_dom/FINSHARK/Alpha-Deputy/.conda/Library/bin/thriftmd.dll" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)
