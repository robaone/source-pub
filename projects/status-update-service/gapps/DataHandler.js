function DataHandler(sheet,memberIds,conjugator){
  this.sheet = sheet;
  this.memberIds = Array.isArray(memberIds) ? memberIds : [memberIds];
  this.conjugator = conjugator;
  this.handle = function(request){
    Logger.log('DataHandler.handle(request)');
    var data = this.parse(JSON.parse(request.postData.contents));
    var rowData = this.toRowData(data);
    if(data.memberId && this.memberIds.includes(data.memberId)){
      this.sheet.appendRow(rowData);
      if(data.type == 'commentCard'){
        var message = this.conjugator.toStatusMessage(data.title);
        data['statusMessage'] = message;
        Logger.log(message);
      }
    }
    return data;
  };
  this.toRowData = function(data){
    return [
      new Date(),
      'POST',
      JSON.stringify(data.content),
      data.title,
      data.username,
      data.type,
      data.memberId
    ];
  }
  this.parse = function(content){
    var data = {
      "title": content.action.data.card.name,
      "type": content.action.type,
      "memberId": content.action.idMemberCreator,
      "username": content.action.memberCreator.username,
      "content": content
    };
    return data;
  }
}

function DataHandlerTest(){
  this.test_handle = function(){
    // GIVEN
    var sheet = {
      'appendRow':function(rowData){
        Logger.log('appending ' + JSON.stringify(rowData));
      }
    };
    var request = {
      "parameters": {},
      "queryString": "",
      "postData": {
        "contents": "{\"model\":{\"id\":\"modelId\",\"name\":\"My Work\",\"desc\":\"Use this simple Kanban template to keep the engineering team on the same page and moving through work fluidly. \\n\\n1. Break down the roadmap by adding tasks as cards to the **Backlog** list. \\n\\n2. Move the cards one-by-one through **Design** as they becomes more fleshed out. *Pro tip:* You can enable Power-ups for your favorite design tools like [Figma](https:\\/\\/trello.com\\/power-ups\\/59b2e7611e6ece0b35eac16a\\/figma) or [Invision](https:\\/\\/trello.com\\/power-ups\\/596f2cb2d279152540b2bb31), in order to easily link and view designs without switching context.\\n\\n3. When a card is fully specced out and designs are attached, move it to **To Do** for engineers to pick up. \\n\\n4. Engineers move cards to **Doing** and assign themselves to the cards, so the whole team stays informed of who is working on what.\\n\\n5. Cards then move through **Code Review** when they're ready for a second set of eyes. The team can set a **List Limit** (with the List Limit Power-up) on the number of cards in Code Review, as a visual indicator for when the team needs to prioritize reviews rather than picking up new work. \\n\\n6. Once cards move through **Testing** and eventually ship to production, move them to **Done** and celebrate!\\n\",\"descData\":null,\"closed\":false,\"idOrganization\":null,\"idEnterprise\":null,\"pinned\":false,\"url\":\"https:\\/\\/trello.com\\/b\\/Oy6P7chn\\/my-work\",\"shortUrl\":\"https:\\/\\/trello.com\\/b\\/Oy6P7chn\",\"prefs\":{\"permissionLevel\":\"private\",\"hideVotes\":false,\"voting\":\"disabled\",\"comments\":\"members\",\"invitations\":\"members\",\"selfJoin\":false,\"cardCovers\":true,\"isTemplate\":false,\"cardAging\":\"regular\",\"calendarFeedEnabled\":false,\"background\":\"5c7aa22a16b21f0c3e69cfb7\",\"backgroundImage\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/1365x2048\\/abe25dbf43a33f89770e1e0b51c2d599\\/photo-1542546068979-b6affb46ea8f\",\"backgroundImageScaled\":[{\"width\":67,\"height\":100,\"url\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/67x100\\/d0bb2e3add0b6ebc76d38ff39a5eb65d\\/photo-1542546068979-b6affb46ea8f.jpg\"},{\"width\":128,\"height\":192,\"url\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/128x192\\/d0bb2e3add0b6ebc76d38ff39a5eb65d\\/photo-1542546068979-b6affb46ea8f.jpg\"},{\"width\":320,\"height\":480,\"url\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/320x480\\/d0bb2e3add0b6ebc76d38ff39a5eb65d\\/photo-1542546068979-b6affb46ea8f.jpg\"},{\"width\":640,\"height\":960,\"url\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/640x960\\/d0bb2e3add0b6ebc76d38ff39a5eb65d\\/photo-1542546068979-b6affb46ea8f.jpg\"},{\"width\":683,\"height\":1024,\"url\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/683x1024\\/d0bb2e3add0b6ebc76d38ff39a5eb65d\\/photo-1542546068979-b6affb46ea8f.jpg\"},{\"width\":853,\"height\":1280,\"url\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/853x1280\\/d0bb2e3add0b6ebc76d38ff39a5eb65d\\/photo-1542546068979-b6affb46ea8f.jpg\"},{\"width\":1280,\"height\":1920,\"url\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/1280x1920\\/d0bb2e3add0b6ebc76d38ff39a5eb65d\\/photo-1542546068979-b6affb46ea8f.jpg\"},{\"width\":1066,\"height\":1600,\"url\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/1066x1600\\/d0bb2e3add0b6ebc76d38ff39a5eb65d\\/photo-1542546068979-b6affb46ea8f.jpg\"},{\"width\":1365,\"height\":2048,\"url\":\"https:\\/\\/trello-backgrounds.s3.amazonaws.com\\/SharedBackground\\/1365x2048\\/abe25dbf43a33f89770e1e0b51c2d599\\/photo-1542546068979-b6affb46ea8f\"}],\"backgroundTile\":false,\"backgroundBrightness\":\"light\",\"backgroundBottomColor\":\"#d6d4d3\",\"backgroundTopColor\":\"#dddedf\",\"canBePublic\":true,\"canBeEnterprise\":true,\"canBeOrg\":true,\"canBePrivate\":true,\"canInvite\":true},\"labelNames\":{\"green\":\"Priority\",\"yellow\":\"Waiting for feedback\",\"orange\":\"Research\",\"red\":\"Having Difficulty\",\"purple\":\"Requirement\",\"blue\":\"Pending Update\",\"sky\":\"Enhancement\",\"lime\":\"\",\"pink\":\"Retro\",\"black\":\"One More Approval\"}},\"action\":{\"id\":\"5ff8e79124603064c207e0e3\",\"idMemberCreator\":\"memberId\",\"data\":{\"text\":\"I figured out how to forward a post request to Google Apps script.\",\"card\":{\"id\":\"5f80880e8078885d1f805fb9\",\"name\":\"Add a trigger between Trello and Slack so that whatever ticket I'm working on will be reflected as a comment in the #dev channel\",\"idShort\":53,\"shortLink\":\"pXID5JR8\"},\"board\":{\"id\":\"5f73576d8c515547938c3535\",\"name\":\"My Work\",\"shortLink\":\"Oy6P7chn\"},\"list\":{\"id\":\"5f73576d8c515547938c3539\",\"name\":\"Doing \\ud83c\\udfc3\\ud83c\\udffe\\u200d\\u2642\\ufe0f\"}},\"type\":\"commentCard\",\"date\":\"2021-01-08T23:15:29.289Z\",\"appCreator\":null,\"limits\":{\"reactions\":{\"perAction\":{\"status\":\"ok\",\"disableAt\":1000,\"warnAt\":900},\"uniquePerAction\":{\"status\":\"ok\",\"disableAt\":17,\"warnAt\":16}}},\"display\":{\"translationKey\":\"action_comment_on_card\",\"entities\":{\"contextOn\":{\"type\":\"translatable\",\"translationKey\":\"action_on\",\"hideIfContext\":true,\"idContext\":\"5f80880e8078885d1f805fb9\"},\"card\":{\"type\":\"card\",\"hideIfContext\":true,\"id\":\"5f80880e8078885d1f805fb9\",\"shortLink\":\"pXID5JR8\",\"text\":\"Add a trigger between Trello and Slack so that whatever ticket I'm working on will be reflected as a comment in the #dev channel\"},\"comment\":{\"type\":\"comment\",\"text\":\"I figured out how to forward a post request to Google Apps script.\"},\"memberCreator\":{\"type\":\"member\",\"id\":\"memberId\",\"username\":\"anselrobateau1\",\"text\":\"Ansel Robateau\"}}},\"memberCreator\":{\"id\":\"memberId\",\"username\":\"anselrobateau1\",\"activityBlocked\":false,\"avatarHash\":\"7ec4fee6ab154587b283ed5adc723a65\",\"avatarUrl\":\"https:\\/\\/trello-members.s3.amazonaws.com\\/memberId\\/7ec4fee6ab154587b283ed5adc723a65\",\"fullName\":\"Ansel Robateau\",\"idMemberReferrer\":null,\"initials\":\"AR\",\"nonPublic\":[],\"nonPublicAvailable\":true}}}",
        "length": 5852,
        "name": "postData",
        "type": "application/json"
      },
      "contentLength": 5852,
      "contextPath": "",
      "parameter": {}
    };
    var conjugator = {
      'toStatusMessage':function(){
        return 'Status message';
      }
    };
    var handler = new DataHandler(sheet,'memberId',conjugator);
    
    // WHEN
    var data = handler.handle(request);
    
    // THEN
    Assert.match('Status message',data.statusMessage);
    
  }
  
  this.test_parse = function(){
    // GIVEN
    var sheet = {};
    var memberId = 'memberId';
    var conjugator = {};
    var handler = new DataHandler(sheet,memberId,conjugator);
    var content = {"model":{"id":"5f73576d8c515547938c3535","name":"My Work","desc":"Use this simple Kanban template to keep the engineering team on the same page and moving through work fluidly. \n\n1. Break down the roadmap by adding tasks as cards to the **Backlog** list. \n\n2. Move the cards one-by-one through **Design** as they becomes more fleshed out. *Pro tip:* You can enable Power-ups for your favorite design tools like [Figma](https:\/\/trello.com\/power-ups\/59b2e7611e6ece0b35eac16a\/figma) or [Invision](https:\/\/trello.com\/power-ups\/596f2cb2d279152540b2bb31), in order to easily link and view designs without switching context.\n\n3. When a card is fully specced out and designs are attached, move it to **To Do** for engineers to pick up. \n\n4. Engineers move cards to **Doing** and assign themselves to the cards, so the whole team stays informed of who is working on what.\n\n5. Cards then move through **Code Review** when they're ready for a second set of eyes. The team can set a **List Limit** (with the List Limit Power-up) on the number of cards in Code Review, as a visual indicator for when the team needs to prioritize reviews rather than picking up new work. \n\n6. Once cards move through **Testing** and eventually ship to production, move them to **Done** and celebrate!\n","descData":null,"closed":false,"idOrganization":null,"idEnterprise":null,"pinned":false,"url":"https:\/\/trello.com\/b\/Oy6P7chn\/my-work","shortUrl":"https:\/\/trello.com\/b\/Oy6P7chn","prefs":{"permissionLevel":"private","hideVotes":false,"voting":"disabled","comments":"members","invitations":"members","selfJoin":false,"cardCovers":true,"isTemplate":false,"cardAging":"regular","calendarFeedEnabled":false,"background":"5c7aa22a16b21f0c3e69cfb7","backgroundImage":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/1365x2048\/abe25dbf43a33f89770e1e0b51c2d599\/photo-1542546068979-b6affb46ea8f","backgroundImageScaled":[{"width":67,"height":100,"url":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/67x100\/d0bb2e3add0b6ebc76d38ff39a5eb65d\/photo-1542546068979-b6affb46ea8f.jpg"},{"width":128,"height":192,"url":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/128x192\/d0bb2e3add0b6ebc76d38ff39a5eb65d\/photo-1542546068979-b6affb46ea8f.jpg"},{"width":320,"height":480,"url":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/320x480\/d0bb2e3add0b6ebc76d38ff39a5eb65d\/photo-1542546068979-b6affb46ea8f.jpg"},{"width":640,"height":960,"url":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/640x960\/d0bb2e3add0b6ebc76d38ff39a5eb65d\/photo-1542546068979-b6affb46ea8f.jpg"},{"width":683,"height":1024,"url":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/683x1024\/d0bb2e3add0b6ebc76d38ff39a5eb65d\/photo-1542546068979-b6affb46ea8f.jpg"},{"width":853,"height":1280,"url":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/853x1280\/d0bb2e3add0b6ebc76d38ff39a5eb65d\/photo-1542546068979-b6affb46ea8f.jpg"},{"width":1280,"height":1920,"url":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/1280x1920\/d0bb2e3add0b6ebc76d38ff39a5eb65d\/photo-1542546068979-b6affb46ea8f.jpg"},{"width":1066,"height":1600,"url":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/1066x1600\/d0bb2e3add0b6ebc76d38ff39a5eb65d\/photo-1542546068979-b6affb46ea8f.jpg"},{"width":1365,"height":2048,"url":"https:\/\/trello-backgrounds.s3.amazonaws.com\/SharedBackground\/1365x2048\/abe25dbf43a33f89770e1e0b51c2d599\/photo-1542546068979-b6affb46ea8f"}],"backgroundTile":false,"backgroundBrightness":"light","backgroundBottomColor":"#d6d4d3","backgroundTopColor":"#dddedf","canBePublic":true,"canBeEnterprise":true,"canBeOrg":true,"canBePrivate":true,"canInvite":true},"labelNames":{"green":"Priority","yellow":"Waiting for feedback","orange":"Research","red":"Having Difficulty","purple":"Requirement","blue":"Pending Update","sky":"Enhancement","lime":"","pink":"Retro","black":"One More Approval"}},"action":{"id":"5ff8e79124603064c207e0e3","idMemberCreator":"memberId","data":{"text":"I figured out how to forward a post request to Google Apps script.","card":{"id":"5f80880e8078885d1f805fb9","name":"Add a trigger between Trello and Slack so that whatever ticket I'm working on will be reflected as a comment in the #dev channel","idShort":53,"shortLink":"pXID5JR8"},"board":{"id":"5f73576d8c515547938c3535","name":"My Work","shortLink":"Oy6P7chn"},"list":{"id":"5f73576d8c515547938c3539","name":"Doing \ud83c\udfc3\ud83c\udffe\u200d\u2642\ufe0f"}},"type":"commentCard","date":"2021-01-08T23:15:29.289Z","appCreator":null,"limits":{"reactions":{"perAction":{"status":"ok","disableAt":1000,"warnAt":900},"uniquePerAction":{"status":"ok","disableAt":17,"warnAt":16}}},"display":{"translationKey":"action_comment_on_card","entities":{"contextOn":{"type":"translatable","translationKey":"action_on","hideIfContext":true,"idContext":"5f80880e8078885d1f805fb9"},"card":{"type":"card","hideIfContext":true,"id":"5f80880e8078885d1f805fb9","shortLink":"pXID5JR8","text":"Add a trigger between Trello and Slack so that whatever ticket I'm working on will be reflected as a comment in the #dev channel"},"comment":{"type":"comment","text":"I figured out how to forward a post request to Google Apps script."},"memberCreator":{"type":"member","id":"memberId","username":"anselrobateau1","text":"Ansel Robateau"}}},"memberCreator":{"id":"memberId","username":"anselrobateau1","activityBlocked":false,"avatarHash":"7ec4fee6ab154587b283ed5adc723a65","avatarUrl":"https:\/\/trello-members.s3.amazonaws.com\/memberId\/7ec4fee6ab154587b283ed5adc723a65","fullName":"Ansel Robateau","idMemberReferrer":null,"initials":"AR","nonPublic":[],"nonPublicAvailable":true}}};
    
    // WHEN
    var data = handler.parse(content);
    
    // THEN
    Logger.log(data);
    Assert.match('memberId',data.memberId);
  }
}

function test_datahandler(){
  new Test(new DataHandlerTest()).run();
}