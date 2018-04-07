Theatre Scraping
================

I've long dreamed of having a tool that automatically collects data about theatre performances.

Todo
====

 - [ ] Implement caching of html documents by url.

Design
======

*Caching*

All files that are scraped for data are also cached on the file system in their original form as downloaded. The filename is constructed by replacing invalid characters with some substitute. A human-readable timestamp is appended to the end. The idea being that at first, the cache will be something I interact with manually often. Perhaps at some point this will change. Anyways, there is a constant that defines the maximum age after which a new copy is downloaded. I think I will make the maximum age be, at first, a day old. 
