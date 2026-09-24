<?php

namespace App\Services;

use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Google\Service\Calendar\ConferenceData;
use Google\Service\Calendar\CreateConferenceRequest;
use Google\Service\Calendar\ConferenceSolutionKey;

class GoogleMeetService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(env('GOOGLE_CLIENT_ID'));
        $this->client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $this->client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $this->client->addScope(Calendar::CALENDAR_EVENTS);
    }

    public function createClassMeeting($accessToken, $classData)
    {
        $this->client->setAccessToken($accessToken);
        $service = new Calendar($this->client);

        // 1. Configure Meeting Event
        $event = new Event([
            'summary'     => $classData['title'],
            'description' => 'Online Live Class for enrolled students.',
            'start'       => ['dateTime' => date('c', strtotime($classData['start_time']))],
            'end'         => ['dateTime' => date('c', strtotime($classData['end_time']))],
        ]);

        // 2. Request Google Meet Conference Data
        $conferenceRequest = new CreateConferenceRequest();
        $conferenceRequest->setRequestId('class-' . uniqid());
        
        $solutionKey = new ConferenceSolutionKey();
        $solutionKey->setType('hangoutsMeet');
        $conferenceRequest->setConferenceSolutionKey($solutionKey);

        $conferenceData = new ConferenceData();
        $conferenceData->setCreateRequest($conferenceRequest);
        $event->setConferenceData($conferenceData);

        // 3. Insert Event into Google Calendar with conferenceDataVersion = 1
        $createdEvent = $service->events->insert('primary', $event, ['conferenceDataVersion' => 1]);

        return [
            'event_id'  => $createdEvent->getId(),
            'meet_link' => $createdEvent->getHangoutLink(),
        ];
    }
}