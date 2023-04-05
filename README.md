# HealthCorps-Performance-Testing

I’ve completed the performance test on HealthCorps.

Test executed for the below-mentioned scenario in server [HealthCorps](https://www.healthcorps.org/)

**1. 100 Concurrent Request with 0 Loop Count; Avg TPS for Total Samples is ~ 6.1 And Total Concurrent API requested: 800.**

**2. 120 Concurrent Request with 0 Loop Count; Avg TPS for Total Samples is ~ 6.4  And Total Concurrent API requested: 960.**

**3. 150 Concurrent Request with 0 Loop Count; Avg TPS for Total Samples is ~ 14.5  And Total Concurrent API requested: 1200.**

**4. 200 Concurrent Request with 0 Loop Count; Avg TPS for Total Samples is ~ 18 And Total Concurrent API requested: 1600.**

**While executing 200 concurrent requests, I found 961 requests got connection timeout, and the error rate is 60.06%.**

**Summary: The server can handle almost a concurrent 800 API calls with almost zero (0) error rate**

Please find the details report in the attachment and let me know if you have any further queries. 
====================================================================
1. [Healthcorps__test_100](https://642d7e27e3774438f8b317c7--delightful-crostata-f10a25.netlify.app/)  
2. []()
3. []()
4. []()
From,  

Fahad Bin Wadud

