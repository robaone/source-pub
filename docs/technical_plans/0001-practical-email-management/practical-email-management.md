# Practical Email Management

<!-- toc -->

- [Context](#context)
- [Decision](#decision)
- [Glossary](#glossary)
- [Technical Risks / Assumptions](#technical-risks--assumptions)
  * [Google App Script only works with Gmail](#google-app-script-only-works-with-gmail)
    + [Technical Risk Mitigation Strategies](#technical-risk-mitigation-strategies)
  * [App script runtime may exceed the limit](#app-script-runtime-may-exceed-the-limit)
    + [Technical Risk Mitigation Strategies](#technical-risk-mitigation-strategies-1)
- [Prerequisites](#prerequisites)
  * [Diagrams](#diagrams)
- [Feature: Allow only important email to appear in the inbox](#feature-allow-only-important-email-to-appear-in-the-inbox)
  * [Scenario: Divert all e-mail to a folder other than inbox](#scenario-divert-all-e-mail-to-a-folder-other-than-inbox)
    + [Notes](#notes)
    + [Code Sample](#code-sample)
  * [Scenario: Allow an e-mail user to store email queries](#scenario-allow-an-e-mail-user-to-store-email-queries)
    + [Notes](#notes-1)
  * [Scenario: Move e-mail into inbox that match search queries](#scenario-move-e-mail-into-inbox-that-match-search-queries)
    + [Notes](#notes-2)
    + [UAT Steps](#uat-steps)
- [Project Checklists](#project-checklists)
  * [Potential for learning / expense](#potential-for-learning--expense)
  * [Technical Debt](#technical-debt)

<!-- tocstop -->

## Context

Email users suffer from email overload.  This can lead to stress, decreased satisfaction and reduced productivity.  Unsolicited email can also include malware and security attacks like email spoofing and phishing.

**Issue:** https://github.com/robaone/source-pub/issues/4

## Decision

Implement the Cherry Picking Method as described in https://site.robaone.com/blog/practical-email-management.  This involves a script that moves emails into the inbox using search terms provided by the user.

This will be implemented in Google App Script and Gmail.

## Glossary

You can find the glossary [here](https://github.com/robaone/source-pub/blob/main/glossary.md) in case a term in this technical plan is unfamiliar

- git-flow: A Git branching model that involves the use of feature branches.  It is described at https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
- Apps Script: A cloud-based JavaScript plantform.  More details can be found at https://developers.google.com/apps-script/
- clasp: Command line tools to enable local development of Apps Script projects: More details can be found at https://github.com/google/clasp
- GMail: A cloud based email service.  More details can be found at https://www.google.com/gmail/about/

## Technical Risks / Assumptions

### Google App Script only works with Gmail

This implementation will only work with Gmail.

#### Technical Risk Mitigation Strategies

1. Clearly state that this implementation is only designed for Gmail.  It is up to the user to implement a solution for another email service.

### App script runtime may exceed the limit

Google App scripts have a runtime limit of 6 minutes.  This means that a single execution of a script can last no longer than 6 minutes.

There are other limitations that must be considered.  Those limits are listed here. 
https://developers.google.com/apps-script/guides/services/quotas

#### Technical Risk Mitigation Strategies

1. Monitor usage during testing and make adjustments as needed.
1. Utilize batch processing (process limited collections of messages)
1. Limit timed executions so that it fits within the execution quota.  This means that we should avoid executing the script more than once every 5 minutes.

## Prerequisites

- Create a Google App Script project by installing and configuring clasp
- Create a deployment workflow that works with git-flow
  - A feature branch will push code to a DEV project
  - A merge to develop will publish changes to a DEV project
  - A release branch will push changes to a PROD project
  - A merge to main will publish changes to a PROD project
- Add unit testing framework, jest

### Diagrams

![email diversion](https://user-images.githubusercontent.com/1625881/166932743-08f20c31-fe8e-450d-9e9e-609648b0293a.png)
![query storage](https://user-images.githubusercontent.com/1625881/166933114-09c40639-d3fb-4e57-b294-5f89280d6567.png)
![app script](https://user-images.githubusercontent.com/1625881/167252609-22b8db43-e63c-440d-a762-30488f9f380a.png)

## Feature: Allow only important email to appear in the inbox

**In order to** regain control of email  
**As a** email user  
**I want to** prevent all email from appearing in my inbox except those that I deem important  

### Scenario: Divert all e-mail to a folder other than inbox

```gherkin
Given a GMail account with label "Other"
When a new email is received
Then the email is not in the Inbox
And the email has label "Other"
```

#### Notes

This can be implemented with a reverse email filter.

#### Code Sample

Here is an example of a reverse email filter.

```xml
<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:apps='http://schemas.google.com/apps/2006'>
  <title>Mail Filters</title>
  <entry>
    <category term='filter'></category>
    <title>Mail Filter</title>
    <apps:property name='from' value='-important-person@domain.com'/>
    <apps:property name='hasTheWord' value='label:inbox'/>
    <apps:property name='label' value='Other'/>
    <apps:property name='shouldArchive' value='true'/>
    <apps:property name='sizeOperator' value='s_sl'/>
    <apps:property name='sizeUnit' value='s_smb'/>
  </entry>
</feed>
```

### Scenario: Allow an e-mail user to store email queries 

```gherkin
When an email user saves a gmail query with data:
"""
<QUERY>
"""
Then the list of queries is viewable and editable by the user
```

Summary

| QUERY                   |
|-------------------------|
| from:myfriend@gmail.com |
| subject:(important)     |
| from:@myschool.com      |

#### Notes

Using a Google spreadsheet accomplishes this task.
Benefits include ease of use and compatibility on desktop and mobile devices
including built in security and API access.

### Scenario: Move e-mail into inbox that match search queries

```gherkin
Given a timer that is triggered every "<INTERVAL>" minutes
When the timer is triggered
Then e-mails matching all stored email queries are in the inbox
```

#### Notes

Limit the scope of the search to unread emails that are not in the inbox.
Limit the scope of the search to the last two weeks.

#### UAT Steps

1. Open your gmail account
2. Create a label called "Other"
3. Create an email filter that diverts all emails except those from an important person to the "Other" label
4. No new emails other than those of the very important person will arrive in the inbox
4. Save an email query in the spreadsheet
5. Trigger the script
7. All emails matching the search query that have not been read, are not in the inbox and were received within the last two weeks will appear in the inbox.

## Project Checklists

### Potential for learning / expense
1. Are you using a service or technology that's new? yes
   1. Google App Script
   1. Google clasp
2. Are you replacing a service or technology? no

### Technical Debt

1. Have you considered addressing any technical debt in this plan? no
