# Practical Email Management

{ toc }

## Context

Email users suffer from email overload.  This can lead to stress, decreased satisfaction and reduced productivity.  Unsolicited email can also include malware and security attacks like email spoofing and phishing.

**Issue:** https://github.com/robaone/source-pub/issues/4

## Decision

Implement the Cherry Picking Method as described in https://site.robaone.com/blog/practical-email-management.  This involves a script that moves emails into the inbox using search terms provided by the user.

This will be implemented in Google App Script and Gmail.

## Glossary

You can find the glossary [here](https://github.com/robaone/source-pub/blob/main/glossary.md) in case a term in this technical plan is unfamiliar

- git-flow: A Git branching model that involves the use of feature branches.  It is described [here](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

## Technical Risks / Assumptions

### Google App Script only works with Gmail

This implementation may be useful for those who are not using Gmail but this implementation will only work with Gmail.

#### Technical Risk Mitigation Strategies

1. Clearly state that this implementation is only designed for Gmail.  It is up to the user to implement a solution for another email service.

### App script runtime may exceed the limit

Google App scripts have a runtime limit of 6 minutes.  This means that a single execution of a script can last no longer than 6 minutes.

There are other limitations that must be considered.  Those limits are listed here. 
https://developers.google.com/apps-script/guides/services/quotas

#### Technical Risk Mitigation Strategies

1. Monitor usage during testing and make adjustments as needed.
1. Utilize batch processing (process limited collections of messages)
1. Limit timed executions so that it fits within the execution quota.

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

{ supporting notes, optional }

#### Code Sample

{ code samples, preferred no, optional }

#### Designs

- { design references, required when applicable }

### Scenario: Allow an e-mail user to store email queries 

```gherkin
{ gherkin language for the scenario.  Use a markdown block. , required }
```

#### Notes

{ supporting notes, optional }

#### Code Sample

{ code samples, preferred no, optional }

#### Designs

- { design references, required when applicable }

### Scenario: Move e-mail into inbox that match search queries

```gherkin
{ gherkin language for the scenario.  Use a markdown block. , required }
```

#### Notes

{ supporting notes, optional }

#### Code Sample

{ code samples, preferred no, optional }

#### Designs

- { design references, required when applicable }

#### UAT Steps

1. { uat steps to be performed }
{ Audience: The target user 
  Reasoning: In order to test the feature functionality, the target user needs to know how these features will be tested }

## Project Checklists

### Data model update
{ required }
{ Audience: developers }
1.Does this technical plan involve updating any existing data models? { yes or no }
   - { if yes, please describe your backwards-compatibility strategy -- how to handle out-of-date data }
1. Does this plan involve changes to client-exposed or expected data? { yes or no }
   - { if yes, please provide here the new agreed-upon data model }

### Potential for learning / expense
{ required }
{ Audience: developers and benefactors  }
1. Are you using a service or technology that's new?
   1. { yes or no }
2. Are you replacing a service or technology?
   1. { yes or no }

### Technical Debt
{ optional }
1. Have you considered addressing any technical debt in this plan?
    1. { link(s) to technical debt document(s) }
