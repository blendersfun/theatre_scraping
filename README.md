Theatre Scraping
================

I've long dreamed of having a tool that automatically collects data about theatre performances.

About
=====

I want to compile an organized, comprehensive, up-to-date database of theatre performance data for a locale that is collected automatically and easy to maintain. I am aware that there may be legal ramifications of the scraping of copyrighted sites. This project is currently in the stage of technical proof of concept. Eventually, if the database that is produced begins to seem valuable I will begin investigating the necessary steps to get permission to use the data I am collecting.

The hope is that the work to collect and organize this data will actually be appreciated by the community I hope to serve which includes the producers of said data. If this database or any web interface into it is eventually made public, it will be with the explicit permission to use the data that it contains. I foresee a negotiation process like so:

 1. Explain the benefit of a comprehensive public collection of performance information.
 2. Ask the owner of the data if they would like to participate in the collection.
 3. Offer that we could scrape their site, or they could submit data manually. I would suggest that scraping would be the easiest way to begin as it would not any effort that they are not already doing.
 4. Follow their wishes as to whether to participate or not in the collection.

*References and Research*

 - https://benbernardblog.com/web-scraping-and-crawling-are-perfectly-legal-right/

Todo
====

 - [x] Implement caching of html documents by url.
 - [ ] Implement the extraction of the raw data.
 - [ ] Create a JSON schema to represent to canonical format for this first data type.
 - [ ] Implement normalization and transformation functions to map the data onto the canonical format.

Design
======

*Caching*

All files that are scraped for data are also cached on the file system in their original form as downloaded. The filename is constructed by replacing invalid characters with some substitute. A human-readable timestamp is appended to the end. The idea being that at first, the cache will be something I interact with manually often. Perhaps at some point this will change. Anyways, there is a constant that defines the maximum age after which a new copy is downloaded. I think I will make the maximum age be, at first, a day old.

*Data Ingestion*

The ingestion of data will be a several step process:
 - Selection: identifying and pulling out the parts of the DOM we care about.
 - Normalization: converting the raw string data into a canonical untransformed input format. Normalizers should be simple, but often particular per situation.
 - Transformation: take a valid form of input and transform it into the canonical data format. Transformers may perform complex transformations and calculations, but should be abstracted from the particulars of a given situation.
 - Deduplication: this is where repeated data referring to the same real-world objects are collapsed together to form one authoritative version. Which sources get preferences and how multiple copies are identified as being the same still needs thought.
