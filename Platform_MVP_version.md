- Platform MVP version
    0.1.0 - recruitment portal
        - 0.1.x - fixes
    0.2.0 - mini project
        - 0.2.x - development


- Process flow ( partial documented )
    Start to finish
    ( Create entity > Menu > End to End )

----------
- Platform portal and data-store requirements
    - node version 20 +
    - pnpm
    - redis ( redis-server )
        - use for:
            - token store
            - tabs store
                - Entity tabs ( Main Tabs )
                - Application tabs ( Sub Tabs )
                - Grid Report tabs ( Primary tabs for grid )
            - wizard store
                - Steps
                - Traverse Steps
                - Pathname
    - sqlite vs-code extension
----------
- Platform Data-Store Schema
    - Contacts
    - Organizations
    - Roles
    - Reports
----------
- Platform Application Template Goal
    - Login-w/.cy
    - Default Menu
        - Contacts-w/.cy
        - Organization-w/.cy
        - Settings-w/.cy
            - Roles-w/.cy
            - Reports-w/.cy
    - Main Application
        - Grid
        - Wizard
        - Record
        - Dna-Form
            - Form Module
            - Form Filter Grid
        - Login
        - Menu Sidebar
        - Tabs
        - Notifications

- Naming convention
   -  Function -
   -  Variable -
   -  Class -
   -  Interface -
   -  Enum -
   -  Type -
   -  Folder -
   -  File -
